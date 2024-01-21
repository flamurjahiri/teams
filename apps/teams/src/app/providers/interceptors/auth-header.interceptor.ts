import {CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor} from "@nestjs/common";
import {forkJoin, map, mergeMap, Observable, of} from "rxjs";
import {PasswordValidationService} from "../../utils-global/services/password.validation.service";
import {AuthRedisService} from "../../auth/services/auth.redis.service";

@Injectable()
export class AuthHeaderInterceptor implements NestInterceptor {
  @Inject(PasswordValidationService) passwordValidation: PasswordValidationService
  @Inject(AuthRedisService) authRedisService: AuthRedisService

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      mergeMap((r: ({ id: string, password: string, success: boolean })) => {
        const token = generateRandom(r.id, 25);
        return forkJoin([of(r), of(token), this.authRedisService.saveToken(r.id, token)])
      }),
      map(([r, token]) => {
        const response = context.switchToHttp().getResponse();
        response.setHeader('x-access-token', token);
        r['password'] = null;
        return r;
      })
    )
  }


}


const generateRandom = (userId: string, length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return `${result}-userId:${userId}`;
}
