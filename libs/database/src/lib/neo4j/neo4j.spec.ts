import { Test, TestingModule } from '@nestjs/testing';
import { Neo4JUtils } from './services/neo4j.database.service';
import { Neo4jModule } from './neo4j.module';
import { Neo4jConfig } from './entities/neo4j.config';
import { lastValueFrom } from 'rxjs';

describe('neo4j', () => {
  let neoService: Neo4JUtils;

  let moduleRef: TestingModule;

  beforeAll(async () => {
    const {
      global,
      module,
      ...rest
    } = Neo4jModule.forTesting(
      new Neo4jConfig('neo4j://localhost:7687', 'neo4j', 'flamur11'));

    moduleRef = await Test.createTestingModule(rest).compile();
    neoService = moduleRef.get<Neo4JUtils>(Neo4JUtils);
  });


  it('create database', async () => {
    const result = await lastValueFrom(neoService.execute(`CREATE (charlie:Person:Actor {name: 'Charlie Sheen'}), (oliver:Person:Director {name: 'Oliver Stone'})`));
    expect('').toBe('');
  });

});




