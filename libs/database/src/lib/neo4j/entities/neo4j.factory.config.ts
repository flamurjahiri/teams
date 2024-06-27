import { SessionConfig } from 'neo4j-driver-core';
import { Neo4jIndexConfig } from './neo4j.index.config';


export class Neo4jFactoryConfig {
  database: string;
  connectionName?: string;
  indexes: Neo4jIndexConfig[];
  sessionParams?: SessionConfig;


  constructor(database: string, connectionName?: string, indexes?: Neo4jIndexConfig[], sessionParams?: SessionConfig) {
    this.database = database;
    this.indexes = indexes;
    this.connectionName = connectionName;
    this.sessionParams = sessionParams;
  }

  getParams(): SessionConfig {
    return { ...(this.sessionParams || {}), database: this.database };
  }
}
