/* eslint-disable */
import {BadRequestException, Inject, Injectable} from "@nestjs/common";
import {combineLatest, forkJoin, iif, mergeMap, Observable, of, tap, throwError} from "rxjs";
import {DeleteResult, PaginatedEntityResponse, PaginatedFilters, UpdateResult} from "@teams/database";
import {User} from "../entities/users.schema";
import {UserRepository} from "../repository/user.repository";
import {PasswordValidationService} from "../../utils-global/services/password.validation.service";
import {EventEmitter2} from "@nestjs/event-emitter";
import {CodeRequest, ValidateType, ValidateUsersData} from "../dto/validate.users.data";

@Injectable()
export class UserService {
  //region injections
  @Inject(UserRepository) repo: UserRepository
  @Inject(EventEmitter2) emitter: EventEmitter2
  @Inject(PasswordValidationService) passwordValidationService: PasswordValidationService
  //endregion


  //region create
  createUser(user: User): Observable<User> {
    user.expiresAt = new Date();
    return this.repo.getByEmailOrNumber(user.email, user.phoneNumber).pipe(
      mergeMap(users => this.validateNotVerifiedPhoneEmail(users, user.email, user.phoneNumber, 'exists', "ALL")),
      mergeMap(_ => this.passwordValidationService.encodePassword(user.password)),
      tap(password => user.password = password),
      mergeMap(_ => this.repo.createUser(user)),
      tap(user => this.emitter.emit('create-user', user))
    );
  }

  //endregion


  //region get
  getById(id: string): Observable<User> {
    return this.repo.getById(id);
  }

  getUsers(paginatedFilters: PaginatedFilters): Observable<PaginatedEntityResponse<User>> {
    return this.repo.getUsers(paginatedFilters);
  }

  //endregion

  //region delete
  delete(currentUser: string, id: string): Observable<DeleteResult> {
    if (currentUser !== id) {
      return throwError(() => new BadRequestException("You can't delete other users"));
    }
    return this.repo.delete(id);
  }

  //endregion


  //region validate
  validate(req: ValidateUsersData, code: CodeRequest): Observable<UpdateResult> {
    if (req.type === ValidateType.PHONE && !code.code) {
      return throwError(() => new BadRequestException("Code should be provided for phone validations"));
    }

    return this.repo.getById(req.id).pipe(
      mergeMap(u => combineLatest([of(u), this.repo.getByEmailOrNumber(u.email, u.phoneNumber)])),
      mergeMap(([user, users]) => this.validateNotVerifiedPhoneEmail(users, user.email, user.phoneNumber, 'been validated', req.type)),
      mergeMap(_ => this.repo.validate(req.id, req.type)));
  }

  //endregion


  //region utils

  private validateNotVerifiedPhoneEmail(users: User[], email: string, phoneNumber: string, log: string, type: "PHONE" | "ALL" | "EMAIL"): Observable<boolean> {
    if (!users?.length) {
      return of(true);
    }

    const validatedEmail = users.find(u => u.email === email && u.validated?.email);
    const validatedPhoneNumber = users.find(u => u.phoneNumber === phoneNumber && u.validated?.phoneNumber);

    return forkJoin([
      iif(() => type !== "PHONE" && !!validatedEmail, of(`A user with this email already ${log}!`), of('')),
      iif(() => type !== "EMAIL" && !!validatedPhoneNumber, of(`A user with this phone already ${log}!`), of(''))
    ]).pipe(
      mergeMap(errors => iif(() => !!errors?.length, throwError(() => new BadRequestException(`Errors : ${errors.reduce((a, v) => `${a}\n${v}`, "")}`)), of(true))),
    );

  }

  //endregion
}
