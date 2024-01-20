import {Injectable} from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import {Observable} from "rxjs";
import {fromPromise} from "@teams/utils";
import {User} from "../../users/entities/users.schema";

@Injectable()
export class PasswordValidationService {

  encodePassword(rawPassword: string): Observable<string> {
    return fromPromise(bcrypt.hash(rawPassword, bcrypt.genSaltSync()));
  }

  comparePasswords(rawPassword: string, user: User): Observable<boolean> {
    return fromPromise(bcrypt.compare(rawPassword, user.password));
  }
}
