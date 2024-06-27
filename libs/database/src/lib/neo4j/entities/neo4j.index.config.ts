import { IndexType } from '../indexes/index.type';

export class Neo4jIndexConfig {
  table: string;
  field: string[];
  type: IndexType;
}
