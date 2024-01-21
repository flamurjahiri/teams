import {Inject, Injectable, UnauthorizedException} from "@nestjs/common";
import {UserService} from "../../users/services/user.service";
import {PasswordValidationService} from "../../utils-global/services/password.validation.service";
import {combineLatest, iif, map, mergeMap, Observable, of, throwError} from "rxjs";

@Injectable()
export class LoginService {
  @Inject(UserService) private userService: UserService
  @Inject(PasswordValidationService) private passwordValidationService: PasswordValidationService


  canLogin(id: string, password: string): Observable<{ id: string, password: string, success: boolean }> {
    return this.userService.getById(id).pipe(
      mergeMap(user => combineLatest([of(user), this.passwordValidationService.encodePassword(password)])),
      map(([u, p]) => u.password === p),
      mergeMap(r => iif(() => r, of({id, password, success: true}), throwError(() => new UnauthorizedException())))
    );
  }


}
