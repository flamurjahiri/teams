import { Inject } from '@nestjs/common';
import { NEO_4J_DATABASE } from '../assets/constants';


export function Neo4jDatabase(options: { database: string; connectionName?: string; }) {
  return Inject(NEO_4J_DATABASE(options.database, options.connectionName));
}
