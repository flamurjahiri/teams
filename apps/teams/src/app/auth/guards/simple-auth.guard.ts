import {CanActivate, ExecutionContext, Inject, Injectable} from '@nestjs/common'
import {AuthRedisService} from "../services/auth.redis.service";
import {combineLatest, mergeMap, Observable, of} from "rxjs";

@Injectable()
export class SimpleAuthGuard implements CanActivate {
  @Inject(AuthRedisService) authRedisStore: AuthRedisService

  canActivate(context: ExecutionContext): Observable<boolean> {
    return of(context.switchToHttp()?.getRequest()?.headers?.authorization).pipe(
      mergeMap(header => combineLatest([of(header), of(header.split("-userId:")[1].replace("-userId:", ""))])),
      mergeMap(([token, userId]) => this.authRedisStore.isSuccessfullyLogin(userId, token)));
  }
}
