import { BadRequestException, DynamicModule, Module, Provider } from '@nestjs/common';
import { Neo4jConfig } from './entities/neo4j.config';
import { NEO_4J_CONNECTION_DRIVER, NEO_4J_DATABASE, NEO_4J_HEALTH_CHECK } from './assets/constants';
import neo4j, { Driver } from 'neo4j-driver';
import { Neo4JHealthService } from './health/health.service';
import { Neo4JUtils } from './services/neo4j.database.service';
import { ReadOperation } from './processor/impl/read.operation';
import { WriteOperation } from './processor/impl/write.operation';
import { DefaultOperation } from './processor/impl/default.operation';
import { DatabaseOperationProvider } from './processor/database.operation.provider';
import { Neo4jFactoryConfig } from './entities/neo4j.factory.config';
import { filter, from, lastValueFrom, map, mergeMap, toArray } from 'rxjs';


class ConnectionDriver {
  driver: Driver;
  connectionName: string;
  simplifyName: string;
}


@Module({})
export class Neo4jModule {

  static USED_DATABASE: { database: string; connectionName: string }[] = [];

  static forRoot(data: Neo4jConfig | Neo4jConfig[]): DynamicModule {

    const configs = MAP_VALIDATE_ROOT_CONFIGS(data);

    const drivers = configs.map(c => ({
      simplifyName: c.connectionName,
      connectionName: NEO_4J_CONNECTION_DRIVER(c.connectionName),
      driver: neo4j.driver(c.uri, neo4j.auth.basic(c.user, c.password), c.config)
    }));

    const providers = GET_ROOT_PROVIDERS(drivers);

    return {
      global: true,
      module: Neo4jModule,
      exports: [DatabaseOperationProvider, ...providers],
      providers: [...providers, ReadOperation, WriteOperation, DefaultOperation, DatabaseOperationProvider]
    };
  }

  static forFeature(data: Neo4jFactoryConfig | Neo4jFactoryConfig[]): DynamicModule {

    const providers: Provider<Neo4JUtils>[] = GET_FEATURE_PROVIDERS(MAP_FEATURE_CONFIGS(data));

    return {
      global: false,
      module: Neo4jModule,
      providers: providers,
      exports: providers
    };
  }

  static forTesting(data: Neo4jConfig | Neo4jConfig[]): DynamicModule {

    const configs = MAP_VALIDATE_ROOT_CONFIGS(data);

    const drivers = configs.map(c => ({
      connectionName: NEO_4J_CONNECTION_DRIVER(c.connectionName),
      simplifyName: c.connectionName,
      driver: neo4j.driver(c.uri, neo4j.auth.basic(c.user, c.password), c.config)
    }));

    const providers = GET_ROOT_PROVIDERS(drivers);

    const NEO_UTILS_PROVIDERS =
      configs
        .map(r => ({ database: 'neo4j', connectionName: r.connectionName }))
        .filter(r => !Neo4jModule.USED_DATABASE.find(d => d.database === r.database && d.connectionName === r.connectionName))
        .map(config => {
          Neo4jModule.USED_DATABASE.push(config);
          return config;
        })
        .map(config =>
          ({
            provide: NEO_4J_DATABASE(config.database, config.connectionName),
            useFactory: async (provider: DatabaseOperationProvider) => {
              return INIT_INDEXES(config as Neo4jFactoryConfig, new Neo4JUtils(drivers.find(d => d.connectionName === NEO_4J_CONNECTION_DRIVER(config.connectionName)).driver, config.database, provider));
            },
            inject: [DatabaseOperationProvider]
          }));


    return {
      global: false,
      module: Neo4jModule,
      providers: [...providers, ...NEO_UTILS_PROVIDERS, ReadOperation, WriteOperation, DefaultOperation, DatabaseOperationProvider],
      exports: [...providers, ...NEO_UTILS_PROVIDERS]
    };

  }

}

//region root
const MAP_VALIDATE_ROOT_CONFIGS = (data: Neo4jConfig | Neo4jConfig[]): Neo4jConfig[] => {
  const configs = Array.isArray(data) ? data : [{ ...data, connectionName: data.connectionName || 'default' }];

  configs.forEach(c => c.connectionName = c.connectionName || 'default');

  if (configs.filter(d => !d?.connectionName).length) {
    throw new BadRequestException('You should specify a name for this connection');
  }

  const nonUniqueConnection = Object.values(configs.reduce((a, v) => {
    a[v.connectionName] = (a[v.connectionName] || 0) + 1;
    return a;
  }, {} as { [k: string]: number })).find(v => v > 1);

  if (nonUniqueConnection) {
    throw new BadRequestException('You should specify a unique name for every connection');
  }

  return configs;
};


const GET_ROOT_PROVIDERS = (drivers: ConnectionDriver[]): Provider<Driver | string[] | Neo4JHealthService>[] => {

  const driverProviders: Provider<Driver>[] = drivers.map(r => {
    return ({
      provide: r.connectionName,
      useFactory: () => r.driver
    });
  });


  const healthProvider: Provider<Neo4JHealthService> = {
    provide: NEO_4J_HEALTH_CHECK(),
    useValue: new Neo4JHealthService(drivers)
  };

  const customHealthProvider: Provider<Neo4JHealthService>[] = drivers.map(r => ({
    provide: NEO_4J_HEALTH_CHECK(r.simplifyName),
    useValue: new Neo4JHealthService([{ driver: r.driver, connectionName: r.connectionName }])
  }));

  return [...driverProviders, healthProvider, ...customHealthProvider];
};


//endregion

//region feature

const MAP_FEATURE_CONFIGS = (data: Neo4jFactoryConfig | Neo4jFactoryConfig[]): Neo4jFactoryConfig[] => {
  const configs = Array.isArray(data) ? data : [data];

  configs.forEach(c => c.connectionName = c.connectionName || 'default');

  return configs;
};


const GET_FEATURE_PROVIDERS = (configs: Neo4jFactoryConfig[]): Provider<Neo4JUtils>[] => {
  return configs.map(config =>
    ({
      provide: NEO_4J_DATABASE(config.database, config.connectionName),
      useFactory: async (driver: Driver, provider: DatabaseOperationProvider) => {
        return INIT_INDEXES(config, new Neo4JUtils(driver, config.database, provider));
      },
      inject: [NEO_4J_CONNECTION_DRIVER(config.connectionName), DatabaseOperationProvider]
    }));
};


const INIT_INDEXES = (config: Neo4jFactoryConfig, utils: Neo4JUtils): Promise<Neo4JUtils> => {
  if (!config?.indexes?.length) {
    return Promise.resolve(utils);
  }

  return lastValueFrom(
    from(config.indexes).pipe(
      filter(index => index?.length > 0),
      map(index => `${index.startsWith('CREATE INDEX') ? '' : 'CREATE INDEX '}${index}`),
      mergeMap(query => utils.execute(query)),
      toArray(),
      map(() => utils)
    ));
};

//endregion
