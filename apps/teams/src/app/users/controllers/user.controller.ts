import {Body, Controller, Delete, Get, Inject, Param, Post, Put, Query} from "@nestjs/common";
import {JoiValidationPipe} from "@teams/validators";
import {DeleteResult, PaginatedEntityResponse, PaginatedFilters, UpdateResult} from "@teams/database";
import {UserService} from "../services/user.service";
import {Observable} from "rxjs";
import {User} from "../entities/users.schema";
import {CodeRequest, ValidateUsersData} from "../dto/validate.users.data";

@Controller('/users')
export class UserController {
  @Inject(UserService) userService: UserService

  @Get('/:id')
  getUserById(@Param() {id}: { id: string }): Observable<User> {
    return this.userService.getById(id);
  }

  @Get('/')
  getUsers(@Query(new JoiValidationPipe(PaginatedFilters)) paginatedFilters: PaginatedFilters): Observable<PaginatedEntityResponse<User>> {
    return this.userService.getUsers(paginatedFilters);
  }

  @Post('/')
  createUser(@Body(new JoiValidationPipe(User)) user: User): Observable<User> {
    return this.userService.createUser(user);
  }


  @Put('/:id/validate/:type')
  validate(@Param(new JoiValidationPipe(ValidateUsersData)) validateDataReq: ValidateUsersData, @Body(new JoiValidationPipe(CodeRequest)) code: CodeRequest): Observable<UpdateResult> {
    return this.userService.validate(validateDataReq, code);
  }


  @Delete('/:id')
  delete(@Param() {id}: { id: string }): Observable<DeleteResult> {
    //TODO after implementing REQ get from auth
    return this.userService.delete(id, id);
  }

}
