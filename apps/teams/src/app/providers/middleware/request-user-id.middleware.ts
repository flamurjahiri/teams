import {Inject, Injectable, NestMiddleware} from "@nestjs/common";
import {map, of, tap} from "rxjs";
import {HttpRequest} from "../../auth/entities/custom-request.interface";
import {AuthRedisService} from "../../auth/services/auth.redis.service";

@Injectable()
export class RequestUserIdMiddleware implements NestMiddleware {
  @Inject(AuthRedisService) authRedisStore: AuthRedisService


  use(req: HttpRequest, res: Response, next: (error?: any) => void): any {

    if (req?.headers?.authorization) {
      return of(req.headers.authorization).pipe(
        map(header => header.split("-userId:")[1].replace("-userId:", "")),
        tap(id => req.id = id)
      ).subscribe({next: () => next(), error: (err) => next(err)})
    }

    next();

  }
}


