import { Test, TestingModule } from '@nestjs/testing';
import { Neo4JUtils } from './services/neo4j.database.service';
import { Neo4jModule } from './neo4j.module';
import { Neo4jConfig } from './entities/neo4j.config';
import { Driver, Neo4jError } from 'neo4j-driver';
import { Neo4JHealthService } from './health/health.service';
import { NEO_4J_CONNECTION_DRIVER, NEO_4J_DATABASE, NEO_4J_DRIVERS, NEO_4J_HEALTH_CHECK } from './assets/constants';
import { lastValueFrom } from 'rxjs';
import { Neo4jOperation } from './processor/neo4j.operation.type';

describe('neo4j', () => {
  let neoService: Neo4JUtils;

  let moduleRef: TestingModule;

  const drivers: Driver[] = [];
  let driversNames: string[];
  let healthService: Neo4JHealthService;
  const neo4jUtils: Neo4JUtils[] = [];
  let driver: Driver;

  beforeAll(async () => {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      global,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      module,
      ...rest
    } = Neo4jModule.forTesting([
      new Neo4jConfig('neo4j://localhost:7687', 'neo4j', 'flamur11'),
      new Neo4jConfig('neo4j://localhost:7687', 'neo4j', 'flamur11', 'flamurConnection')
    ]);

    moduleRef = await Test.createTestingModule(rest).compile();

    neo4jUtils.push(moduleRef.get<Neo4JUtils>(NEO_4J_DATABASE('neo4j', 'flamurConnection')));
    neo4jUtils.push(moduleRef.get<Neo4JUtils>(NEO_4J_DATABASE('neo4j')));

    drivers.push(moduleRef.get<Driver>(NEO_4J_CONNECTION_DRIVER('flamurConnection')));
    drivers.push(moduleRef.get<Driver>(NEO_4J_CONNECTION_DRIVER()));


    driversNames = moduleRef.get<string[]>(NEO_4J_DRIVERS);
    healthService = moduleRef.get<Neo4JHealthService>(NEO_4J_HEALTH_CHECK);
    driver = drivers[0];
    neoService = neo4jUtils[0];
  });

  it('should ', () => {
    expect(true).toBe(true);
  });

  it('driver injection token', async () => {
    expect(driver).toBeDefined();
    expect(drivers.length).toBe(2);
    expect(await driver.getServerInfo()).toBeDefined();
  });

  it('drivers length token', () => {
    expect(driversNames).toBeDefined();
    expect(driversNames.length).toBe(2);
    expect(driversNames).toContain('flamurConnection');
    expect(driversNames).toContain('default');
  });

  it('neo4jutils ', () => {
    expect(neo4jUtils).toBeDefined();
    expect(neo4jUtils.length).toBe(2);
  });

  it('health check', async () => {
    expect(healthService).toBeDefined();
    const healthCheck = await lastValueFrom(healthService.check());
    expect(healthCheck).toBeDefined();
    const internalHealth = healthCheck['Neo4j Health Check'];
    expect(internalHealth).toBeDefined();
    expect(internalHealth.status).toBe('up');
    expect(Object.keys(internalHealth)).toHaveLength(3);
    expect(Object.keys(internalHealth)).toStrictEqual(['status', 'data', 'duration']);
    expect(Object.keys(internalHealth)).toContain('status');
    expect(Object.keys(internalHealth)).toContain('data');
    expect(Object.keys(internalHealth)).toContain('duration');
    expect(internalHealth.duration).toBeGreaterThan(0);
  });

  it('connect to server', async () => {
    const serverInfo = await driver.getServerInfo();
    expect(serverInfo.address).toContain('localhost:7687');
  });


  it('should insert data', async () => {
    const result = await lastValueFrom(neoService.execute(`CREATE (charlie:Person:Actor {name: 'Charlie Sheen'}), (oliver:Person:Director {name: 'Oliver Stone'})`));
    expect(result.queryType).toBe('w');
    expect(result.database.name).toBe('neo4j');
    expect(result.server.address).toContain('localhost:7687');
    expect(result.counters.containsUpdates()).toBe(true);

    const secondResult = await lastValueFrom(neoService.query(`CREATE
    (flamur2:Person:Actor {name: 'Flamur2 Jahiri'}), (ahmet2:Person:Director {name: 'Ahmet2 Stone'})
    `, Neo4jOperation.WRITE));
    //just to insert the data
    expect(secondResult.length).toEqual(0);
  });

  it('list all data', async () => {
    const r = await lastValueFrom(neoService.query('MATCH (n) RETURN n', Neo4jOperation.READ));

    expect(r).toBeDefined();
    expect(r.length).toBeGreaterThan(0);
    r.map(item => expect(item.has('n')).toBeTruthy());
    expect(r.filter(i => i.has('n')).length).toEqual(r.length);

  });

  it('execute multiple queries', async () => {
    const firstQuery = await lastValueFrom(neoService.query('MATCH (n) RETURN n', Neo4jOperation.READ));
    const multipleQueries = await lastValueFrom(neoService.runQueries(['MATCH (n) RETURN n', 'MATCH (m) RETURN m'], Neo4jOperation.READ));

    expect(firstQuery.length * 2).toEqual(multipleQueries.length);

    expect(firstQuery.length).toEqual(multipleQueries.filter(r => r.has('n')).length);
    expect(firstQuery.length).toEqual(multipleQueries.filter(r => r.has('m')).length);

    expect(multipleQueries.filter(r => r.has('n')).length).toEqual(multipleQueries.filter(r => r.has('m')).length);
  });

  it('delete all data as execution', async () => {

    const query = 'MATCH (n) DETACH DELETE n';

    const result = await lastValueFrom(neoService.execute(query));
    expect(result.queryType).toBe('w');
  });


  it('list all data after delete', async () => {
    const r = await lastValueFrom(neoService.query('MATCH (n) RETURN n', Neo4jOperation.READ));

    expect(r).toBeDefined();
    expect(r.length).toBe(0);
  });


  it('insert data v2', async () => {
    const query = 'CREATE\n' +
      '  (keanu:Person {name: \'Keanu Reever\'}),\n' +
      '  (laurence:Person {name: \'Laurence Fishburne\'}),\n' +
      '  (carrie:Person {name: \'Carrie-Anne Moss\'}),\n' +
      '  (tom:Person {name: \'Tom Hanks\'}),\n' +
      '  (theMatrix:Movie {title: \'The Matrix\'}),\n' +
      '  (keanu)-[:ACTED_IN]->(theMatrix),\n' +
      '  (laurence)-[:ACTED_IN]->(theMatrix),\n' +
      '  (carrie)-[:ACTED_IN]->(theMatrix),\n' +
      '  (tom)-[:DIRECTED]->(theMatrix)\n';

    const result = await lastValueFrom(neoService.query(query, Neo4jOperation.WRITE));

    expect(result.length).toBe(0);
  });


  it('list all data after insertion', async () => {
    const r = await lastValueFrom(neoService.query('MATCH (n) RETURN n', Neo4jOperation.READ));

    expect(r).toBeDefined();
    expect(r.length).toBe(5);
  });

  it('delete all data as query', async () => {

    const query = 'MATCH (n) DETACH DELETE n';

    const result = await lastValueFrom(neoService.query(query, Neo4jOperation.WRITE));
    expect(result.length).toBe(0);
  });


  it('should close connection', async () => {
    const r = await driver.close();

    expect(r).toBeUndefined();
  });

  it('not connect to server (connection has been closed)', async () => {
    await expect(driver?.getServerInfo()).rejects.toThrow(new Neo4jError('Pool is closed, it is no more able to serve requests.', null));
  });

  it('health check down working', async () => {
    await expect(lastValueFrom(healthService.check())).rejects.toThrow();
    expect(await lastValueFrom(healthService.check()).then(() => 'up').catch(() => 'down')).toBe('down');
  });
});




