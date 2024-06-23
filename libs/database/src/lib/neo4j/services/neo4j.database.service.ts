import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { NEO_4J_DATABASE, NEO_4J_DRIVER } from '../assets/constants';
import { Driver } from 'neo4j-driver';
import { finalize, map, Observable, throwError } from 'rxjs';
import { Record, ResultSummary, SessionConfig, TransactionConfig } from 'neo4j-driver-core';
import { OperationProvider } from '../processor/operation.provider';
import { Parameters } from 'neo4j-driver/types/query-runner';
import { Neo4jOperation } from '../entities/neo4j.operation.type';

@Injectable()
export class Neo4JUtils {

  @Inject(NEO_4J_DRIVER) private readonly driver: Driver;
  @Inject(NEO_4J_DATABASE) private readonly database: string;
  @Inject(OperationProvider) private readonly operationProvider: OperationProvider;


  query(query: string, operation: Neo4jOperation, parameters?: Parameters): Observable<Record> {
    return this.runQueries([query], operation, parameters).pipe(
      map(r => r?.[0])
    );
  }

  runQueries(queries: string[], operation: Neo4jOperation, parameters?: Parameters): Observable<Record[]> {
    if (operation === Neo4jOperation.DEFAULT) {
      return throwError(() => new BadRequestException('Only Read/Write Inputs allowed!'));
    }

    return this.run(queries, operation, parameters) as Observable<Record[]>;
  }


  execute(query: string, parameters?: Parameters): Observable<ResultSummary> {
    return this.executeQueries([query], parameters).pipe(
      map(r => r?.[0])
    );
  }

  executeQueries(queries: string[], parameters?: Parameters): Observable<ResultSummary[]> {
    return this.run(queries, Neo4jOperation.DEFAULT, parameters) as Observable<ResultSummary[]>;
  }


  private run(queries: string[],
              operation: Neo4jOperation,
              parameters?: Parameters,
              config?: TransactionConfig,
              sessionParams?: SessionConfig): Observable<ResultSummary[] | Record[]> {
    const session = this.driver.rxSession({ ...(sessionParams || {}), database: this.database });

    const provider = this.operationProvider.getProvider(operation);

    if (!provider) {
      return throwError(() => new BadRequestException('Not supported!'));
    }

    return provider.run(queries, session, parameters || {}, config).pipe(
      finalize(() => session.close().subscribe({ error: (err) => Logger.error('Failed to close session', err) }))
    );
  }


}
