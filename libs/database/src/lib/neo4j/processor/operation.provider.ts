import { Inject, Injectable } from '@nestjs/common';
import { ReadOperation } from './impl/read.operation';
import { WriteOperation } from './impl/write.operation';
import { DefaultOperation } from './impl/default.operation';
import { Neo4jOperationProcessor } from './neo4j.operation.processor';
import { Neo4jOperation } from '../entities/neo4j.operation.type';

@Injectable()
export class OperationProvider {
  @Inject(ReadOperation) private readonly readOperation: ReadOperation;
  @Inject(WriteOperation) private readonly writeOperation: WriteOperation;
  @Inject(DefaultOperation) private readonly defaultOperation: DefaultOperation;


  getProvider(operation: Neo4jOperation): Neo4jOperationProcessor<any> {
    return [this.readOperation, this.writeOperation, this.defaultOperation].find(r => r.getType() === operation);
  }
}
