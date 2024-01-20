import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common'
import {finalize, Observable} from 'rxjs'


@Injectable()
export class ActiveRequestsInterceptor implements NestInterceptor {

  private _activeRequests = 0;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this._activeRequests += 1;
    return next.handle().pipe(
      finalize(() => this._activeRequests -= 1)
    );
  }


  //TODO EXPOSE AS A METRIC
  get activeRequests(): number {
    return this._activeRequests;
  }
}
