import {Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Req, UseGuards} from "@nestjs/common";
import {JoiValidationPipe} from "@teams/validators";
import {DeleteResult, PaginatedEntityResponse, PaginatedFilters, UpdateResult} from "@teams/database";
import {UserService} from "../services/user.service";
import {Observable} from "rxjs";
import {User} from "../entities/users.schema";
import {CodeRequest, ValidateUsersData} from "../dto/validate.users.data";
import {SimpleAuthGuard} from "../../auth/guards/simple-auth.guard";
import {HttpRequest} from "../../auth/entities/custom-request.interface";

@Controller('/users')
export class UserController {
  @Inject(UserService) userService: UserService

  @Get('/:id')
  @UseGuards(SimpleAuthGuard)
  getUserById(@Param() {id}: { id: string }): Observable<User> {
    return this.userService.getById(id);
  }

  @Get('/')
  @UseGuards(SimpleAuthGuard)
  getUsers(@Query(new JoiValidationPipe(PaginatedFilters)) paginatedFilters: PaginatedFilters): Observable<PaginatedEntityResponse<User>> {
    return this.userService.getUsers(paginatedFilters);
  }

  @Post('/')
  createUser(@Body(new JoiValidationPipe(User)) user: User): Observable<User> {
    return this.userService.createUser(user);
  }


  @Put('/:id/validate/:type')
  @UseGuards(SimpleAuthGuard)
  validate(@Param(new JoiValidationPipe(ValidateUsersData)) validateDataReq: ValidateUsersData, @Body(new JoiValidationPipe(CodeRequest)) code: CodeRequest): Observable<UpdateResult> {
    return this.userService.validate(validateDataReq, code);
  }


  @Delete('/:id')
  @UseGuards(SimpleAuthGuard)
  delete(@Req() httpReq: HttpRequest, @Param() {id}: { id: string }): Observable<DeleteResult> {
    return this.userService.delete(httpReq.id, id);
  }

}
