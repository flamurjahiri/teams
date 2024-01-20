/* eslint-disable @typescript-eslint/no-explicit-any */
import {Inject, Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {EventEmitter2} from "@nestjs/event-emitter";
import {ObjectId} from "mongodb";


@Injectable()
export class ProcessExceptions implements OnModuleInit {

  @Inject(EventEmitter2) emitter: EventEmitter2;

  onModuleInit(): any {
    process.on("unhandledRejection", (err) => {
      const entity = {
        stack: err?.['stack'] || "",
        errorAsJson: JSON.stringify(err, Object.getOwnPropertyNames(err))
      }

      this.emitter.emit('intercept.error', {_id: new ObjectId().toString(), entity})

      Logger.error(`unhandledRejection has been triggered : ${entity}`);
    })


    process.on('uncaughtException', (err) => {
      const entity = {
        stack: err?.['stack'] || "",
        errorAsJson: JSON.stringify(err, Object.getOwnPropertyNames(err))
      }

      this.emitter.emit('intercept.error', {_id: new ObjectId().toString(), entity})

      Logger.error(`uncaughtException has been triggered : ${entity}`);

    })
  }

}
