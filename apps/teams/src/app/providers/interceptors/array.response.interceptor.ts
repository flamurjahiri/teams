import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common'
import {map, Observable} from 'rxjs'


@Injectable()
export class ArrayResponseInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(res => Array.isArray(res) ? ({data: res}) : res)
    );
  }
}
