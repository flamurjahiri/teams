import { SessionConfig } from 'neo4j-driver-core';

export class Neo4jFactoryConfig {
  database: string;
  sessionParams?: SessionConfig;


  constructor(database: string, sessionParams?: SessionConfig) {
    this.database = database;
    this.sessionParams = sessionParams;
  }

  getParams(): SessionConfig {
    return { ...(this.sessionParams || {}), database: this.database };
  }
}
