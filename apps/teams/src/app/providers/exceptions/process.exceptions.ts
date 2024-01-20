import {Injectable, Logger, OnModuleInit} from "@nestjs/common";

@Injectable()
export class ProcessExceptions implements OnModuleInit {


  onModuleInit(): any {
    process.on("unhandledRejection", (err) => {
      const entity = {
        stack: err?.['stack'] || "",
        errorAsJson: JSON.stringify(err, Object.getOwnPropertyNames(err))
      }

      Logger.error(`unhandledRejection has been triggered : ${entity}`);
    })


    process.on('uncaughtException', (err) => {
      const entity = {
        stack: err?.['stack'] || "",
        errorAsJson: JSON.stringify(err, Object.getOwnPropertyNames(err))
      }

      Logger.error(`uncaughtException has been triggered : ${entity}`);

    })
  }

}
