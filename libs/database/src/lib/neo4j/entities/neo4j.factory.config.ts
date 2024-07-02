import { SessionConfig } from 'neo4j-driver-core';


export class Neo4jFactoryConfig {
  database: string;
  connectionName?: string;
  indexes: string[];
  sessionParams?: SessionConfig;


  constructor(database: string, connectionName?: string, indexes?: string[], sessionParams?: SessionConfig) {
    this.database = database;
    this.indexes = indexes;
    this.connectionName = connectionName;
    this.sessionParams = sessionParams;
  }
}
