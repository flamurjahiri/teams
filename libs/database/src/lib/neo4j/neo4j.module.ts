import { DynamicModule, Module, Provider } from '@nestjs/common';
import { Neo4jConfig } from './entities/neo4j.config';
import { NEO_4J_DATABASE, NEO_4J_DRIVER } from './assets/constants';
import neo4j, { Driver } from 'neo4j-driver';
import { Neo4JHealthService } from './health/health.service';
import { Neo4JUtils } from './services/neo4j.database.service';
import { ReadOperation } from './processor/impl/read.operation';
import { WriteOperation } from './processor/impl/write.operation';
import { DefaultOperation } from './processor/impl/default.operation';
import { OperationProvider } from './processor/operation.provider';
import { Neo4jFactoryConfig } from './entities/neo4j.factory.config';

@Module({})
export class Neo4jModule {
  static forRoot(data: Neo4jConfig): DynamicModule {
    const provider: Provider<Driver> = {
      provide: NEO_4J_DRIVER,
      useFactory: () => neo4j.driver(data.uri, neo4j.auth.basic(data.user, data.password), data.config)
    };

    return {
      global: true,
      module: Neo4jModule,
      exports: [provider, Neo4JHealthService],
      providers: [provider, Neo4JHealthService]
    };
  }

  static forFeature(config: Neo4jFactoryConfig): DynamicModule {
    return {
      global: false,
      module: Neo4jModule,
      providers: [
        {
          provide: NEO_4J_DATABASE,
          useFactory: async (driver: Driver) => {
            await driver.session().executeWrite(tx => tx.run(`CREATE DATABASE ${config.database} IF NOT EXISTS`));
            return config.database;
          },
          inject: [NEO_4J_DRIVER]
        },
        Neo4JUtils, ReadOperation, WriteOperation, DefaultOperation, OperationProvider
      ],
      exports: [Neo4JUtils]
    };
  }

  static forTesting(data: Neo4jConfig): DynamicModule {
    const driver = neo4j.driver(data.uri, neo4j.auth.basic(data.user, data.password), data.config);
    const provider: Provider<Driver> = {
      provide: NEO_4J_DRIVER,
      useFactory: () => driver
    };

    const databaseProvider = {
      provide: NEO_4J_DATABASE,
      useFactory: async () => {
        // await driver.session().executeWrite(tx => tx.run(`CREATE DATABASE ${config.database} IF NOT EXISTS`));
        return 'neo4j';
      }
    };


    return {
      global: false,
      module: Neo4jModule,
      providers: [
        provider, databaseProvider,
        Neo4JUtils, ReadOperation, WriteOperation, DefaultOperation, OperationProvider
      ],
      exports: [Neo4JUtils]
    };

  }
}
