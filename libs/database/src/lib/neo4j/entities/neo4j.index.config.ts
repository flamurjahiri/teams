import { IndexType } from '../indexes/index.type';

export class Neo4jIndexConfig {
  table: string;
  data: {
    field: string;
    type: IndexType;
  }[];
}
