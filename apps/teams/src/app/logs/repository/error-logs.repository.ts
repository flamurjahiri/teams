/* eslint-disable @typescript-eslint/no-explicit-any */
import {Inject, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {ErrorLog} from "../schemas/error-log.schema";
import {Model} from "mongoose";
import {Observable} from "rxjs";
import {DEFAULT_DATABASE_CONN} from "../../../assets/config.options";
import {MongoUtils} from "@teams/database";

@Injectable()
export class ErrorLogsRepository {

  //region injections
  @Inject(MongoUtils) mongoUtils: MongoUtils
  @InjectModel(ErrorLog.name, DEFAULT_DATABASE_CONN) errorLogModel: Model<ErrorLog>

  //endregion


  insertOne(_id: string, errorEntity: any): Observable<ErrorLog> {
    return this.mongoUtils.insertOneAndGet(this.errorLogModel, {_id, errorEntity});
  }
}
