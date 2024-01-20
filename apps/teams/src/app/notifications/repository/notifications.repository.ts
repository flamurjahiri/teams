/* eslint-disable @typescript-eslint/no-explicit-any */
import {Inject, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Observable} from "rxjs";
import {DEFAULT_DATABASE_CONN} from "../../../assets/config.options";
import {DeleteResult, MongoUtils, UpdateResult} from "@teams/database";
import {Notification} from "../entities/notifications.schema";

@Injectable()
export class NotificationsRepository {

  //region injections
  @Inject(MongoUtils) mongoUtils: MongoUtils
  @InjectModel(Notification.name, DEFAULT_DATABASE_CONN) notificationModel: Model<Notification>

  //endregion

  insertOne(notification: Notification): Observable<Notification> {
    return this.mongoUtils.insertOneAndGet(this.notificationModel, notification);
  }

  deleteByType(userId: string, type: string): Observable<DeleteResult> {
    return this.mongoUtils.deleteOne(this.notificationModel, {userId, type});
  }

  markAsFailed(userId: string, type: string): Observable<UpdateResult> {
    return this.mongoUtils.updateOne(this.notificationModel, {userId, type}, {$set: {status: "FAILED"}});
  }

  getFailed(): Observable<Notification[]> {
    return this.mongoUtils.findMany(this.notificationModel, {status: "FAILED"});
  }
}
