import {CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor} from '@nestjs/common';
import {Observable, tap} from "rxjs";
import {MAX_REQUEST_TIME} from "../../../assets/environments";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {


  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();

    const method = context.getHandler().name;
    const className = context.getClass().name;

    return next.handle().pipe(
      tap(() => {
          const timeInMillis = Date.now() - startTime;
          const timeInSeconds = timeInMillis * 0.001;

          if (timeInSeconds <= MAX_REQUEST_TIME) {
            return;
          }

          Logger.warn(`Method : ${method} - ${className} has delay of : ${timeInSeconds}`);
        }
      )
    )
  }
}
