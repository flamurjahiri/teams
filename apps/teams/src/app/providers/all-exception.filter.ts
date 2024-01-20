/* eslint-disable @typescript-eslint/no-explicit-any */
import {ArgumentsHost, Catch, ExceptionFilter, Logger} from "@nestjs/common";
import {HttpAdapterHost} from "@nestjs/core";
import {HttpStatus} from "@nestjs/common/enums/http-status.enum";


@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly httpStatuses: Record<number, number>;

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
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

    const mapError = mapException(error, this.httpStatuses);


    httpAdapter.reply(httpRequest.getResponse(), mapError, mapError.error.code || 500);
  }


}

const mapException = (err: any, httpStatuses: Record<number, number>): { error: any, status: number } => {
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
