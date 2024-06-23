import { Test, TestingModule } from '@nestjs/testing';
import { Neo4JUtils } from './services/neo4j.database.service';
import { Neo4jModule } from './neo4j.module';
import { Neo4jConfig } from './entities/neo4j.config';
import { Driver, Neo4jError } from 'neo4j-driver';
import { lastValueFrom } from 'rxjs';
import { Neo4JHealthService } from './health/health.service';
import { NEO_4J_DATABASE, NEO_4J_DRIVER } from './assets/constants';
import ConnectionPool from 'ioredis/built/cluster/ConnectionPool';

describe('neo4j', () => {
  let neoService: Neo4JUtils;

  let moduleRef: TestingModule;

  let driver: Driver;
  let database: string;
  let healthService: Neo4JHealthService;

  beforeAll(async () => {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      global,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      module,
      ...rest
    } = Neo4jModule.forTesting(
      new Neo4jConfig('neo4j://localhost:7687', 'neo4j', 'flamur11'));

    moduleRef = await Test.createTestingModule(rest).compile();
    neoService = moduleRef.get<Neo4JUtils>(Neo4JUtils);
    driver = moduleRef.get<Driver>(NEO_4J_DRIVER);
    database = moduleRef.get<string>(NEO_4J_DATABASE);
    healthService = moduleRef.get<Neo4JHealthService>(Neo4JHealthService);
  });

  it('driver injection token', async () => {
    expect(driver).toBeDefined();
    expect(driver.getServerInfo()).toBeDefined();
  });

  it('database injection token', () => {
    expect(database).toBeDefined();
    expect(database).toBe('neo4j');
  });

  it('health check', async () => {
    expect(healthService).toBeDefined();
    const healthCheck = await healthService.check();
    expect(healthCheck).toBeDefined();
    const internalHealth = healthCheck['Neo4j Health Check'];
    expect(internalHealth).toBeDefined();
    expect(internalHealth.status).toBe('up');
    expect(Object.keys(internalHealth)).toHaveLength(3);
    expect(Object.keys(internalHealth)).toStrictEqual(['status', 'error', 'duration']);
    expect(Object.keys(internalHealth)).toContain('status');
    expect(Object.keys(internalHealth)).toContain('error');
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
  });

  it('should close connection', async () => {
    const r = await driver.close();

    expect(r).toBeUndefined();
  });

  it('not connect to server (connection has been closed)', async () => {
    await expect(driver?.getServerInfo()).rejects.toThrow(new Neo4jError('Pool is closed, it is no more able to serve requests.', ConnectionPool.name));
  });

  it('health check down working', async () => {
    await expect(healthService.check()).rejects.toThrow();
    expect(await healthService.check().then(() => 'up').catch(() => 'down')).toBe('down');
  });
});




