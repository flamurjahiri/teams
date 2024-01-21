import {ForbiddenException, Inject, Injectable, NestMiddleware} from "@nestjs/common";
import {iif, map, mergeMap, of, tap, throwError} from "rxjs";
import {HttpRequest, setReqData} from "../../auth/entities/custom-request.interface";
import {AuthRedisService} from "../../auth/services/auth.redis.service";
import {UserService} from "../../users/services/user.service";

@Injectable()
export class RequestUserIdMiddleware implements NestMiddleware {
  //region injections
  @Inject(UserService) userService: UserService
  @Inject(AuthRedisService) authRedisStore: AuthRedisService

  //endregion

  use(req: HttpRequest, res: Response, next: (error?: any) => void): any {

    if (req?.headers?.authorization) {
      return of(req.headers.authorization).pipe(
        map(header => header.split("-userId:")[1].replace("-userId:", "")),
        mergeMap(id => this.userService.getById(id)),
        tap(u => setReqData(req, u)),
        mergeMap(u => iif(() => u.validated.email || u.validated.phoneNumber, of(u), throwError(() => new ForbiddenException("Please verify email or password"))))
      ).subscribe({next: () => next(), error: (err) => next(err)})
    }

    next();

  }
}


