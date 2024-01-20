/* eslint-disable @typescript-eslint/no-explicit-any */
import {Inject, Injectable} from "@nestjs/common";
import {ErrorLogsRepository} from "../repository/error-logs.repository";
import {lastValueFrom} from "rxjs";
import {OnEvent} from "@nestjs/event-emitter";
import {ErrorLog} from "../schemas/error-log.schema";

@Injectable()
export class ErrorLogsService {
  @Inject(ErrorLogsRepository) repository: ErrorLogsRepository;


  @OnEvent('intercept.error', {async: true})
  insertOne(data: { _id: string, entity: any }): Promise<ErrorLog> {
    return lastValueFrom(this.repository.insertOne(data._id, data.entity));
  }
}
