import { Injectable } from '@nestjs/common';
import { Neo4jOperationProcessor } from '../neo4j.operation.processor';
import { RxSession } from 'neo4j-driver';
import { forkJoin, Observable } from 'rxjs';
import { ResultSummary, TransactionConfig } from 'neo4j-driver-core';
import { Parameters } from 'neo4j-driver/types/query-runner';
import { Neo4jOperation } from '../../entities/neo4j.operation.type';

@Injectable()
export class DefaultOperation extends Neo4jOperationProcessor<ResultSummary> {

  run(queries: string[], session: RxSession, parameters?: Parameters, config?: TransactionConfig): Observable<ResultSummary[]> {
    return session.executeWrite(tx => {
      return forkJoin(queries.map(query => tx.run(query, parameters).consume()));
    }, config);
  }

  getType(): Neo4jOperation {
    return Neo4jOperation.DEFAULT;
  }
}
