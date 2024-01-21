import {ForbiddenException, Inject, Injectable, NestMiddleware} from "@nestjs/common";
import {iif, map, mergeMap, of, tap, throwError} from "rxjs";
import {HttpRequest} from "../../auth/entities/custom-request.interface";
import {AuthRedisService} from "../../auth/services/auth.redis.service";
import {UserService} from "../../users/services/user.service";
import {UserSimple} from "../../users/dto/user.simple";

@Injectable()
export class RequestUserIdMiddleware implements NestMiddleware {
  @Inject(AuthRedisService) authRedisStore: AuthRedisService
  @Inject(UserService) userService: UserService

  use(req: HttpRequest, res: Response, next: (error?: any) => void): any {

    if (req?.headers?.authorization) {
      return of(req.headers.authorization).pipe(
        map(header => header.split("-userId:")[1].replace("-userId:", "")),
        mergeMap(id => this.userService.getById(id)),
        tap(u => {
          req.id = u._id;
          req.user = u;
          req.userSimple = new UserSimple(u);
        }),
        mergeMap(u => iif(() => u.validated.email || u.validated.phoneNumber, of(u), throwError(() => new ForbiddenException("Please verify email or password"))))
      ).subscribe({next: () => next(), error: (err) => next(err)})
    }

    next();

  }
}


