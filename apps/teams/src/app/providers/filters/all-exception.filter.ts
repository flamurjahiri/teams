/* eslint-disable @typescript-eslint/no-explicit-any */
import {ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, Logger, NotFoundException} from "@nestjs/common";
import {HttpAdapterHost} from "@nestjs/core";
import {HttpStatus} from "@nestjs/common/enums/http-status.enum";
import {EventEmitter2} from "@nestjs/event-emitter";
import {inspect} from "util";
import {ObjectId} from "mongodb";


@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly httpStatuses: Record<number, number>;

  constructor(private readonly httpAdapterHost: HttpAdapterHost, private readonly emitter: EventEmitter2) {
    this.httpStatuses = Object.values(HttpStatus)
      .map(i => Number(i.toString()))
      .reduce((a, v) => {
        a[v] = v;
        return a;
      }, {});
  }


  catch(error: any, argumentsHost: ArgumentsHost): any {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const {httpAdapter} = this.httpAdapterHost;

    //currently only http failure because rpc failures
    const httpRequest = argumentsHost.switchToHttp();

    if (!(error instanceof NotFoundException || error?.status === 404 || error instanceof ForbiddenException || error?.status === 403)) {
      const incomingMessage = argumentsHost.getArgs()[0];
      const entity = {
        fullUrl: incomingMessage?.url,
        params: incomingMessage?.params,
        body: incomingMessage?.body,
        bodyAsJson: JSON.stringify(incomingMessage?.body),
        query: incomingMessage?.query,
        routePath: incomingMessage?.route?.path,
        route: incomingMessage?.route,
        user: incomingMessage?.user,
        headers: httpRequest?.getRequest()?.headers || {},
        errorAsJson: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        stack: error?.stack || "",
        response: error?.response || "",
        errorAsInspect: inspect(error || {})
      }

      this.emitter.emit('intercept.error', {_id: new ObjectId().toString(), entity})
    }

    const mapError = mapException(error, this.httpStatuses);


    httpAdapter.reply(httpRequest.getResponse(), mapError, mapError.error.code || 500);
  }


}

const
  mapException = (err: any, httpStatuses: Record<number, number>): { error: any, status: number } => {
    const data = err?.response?.message || err?.response;
    const date = new Date(Date.now());

    let code = err?.status || err?.code || 500;
    if (!httpStatuses[code]) {
      Logger.error('error', `Error code : ${code} is not allowed so returning 500`);
      code = 500;
    }

    const errMessage = err?.response ? err?.response : err?.message;

    const message = (!!err?.status || !!err?.code) ? errMessage : "Something went wrong";


    return {error: {message, code, date, data}, status: code};
  }
