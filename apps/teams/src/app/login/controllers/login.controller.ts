import {Body, Controller, Inject, Param, Post, UseInterceptors} from "@nestjs/common";
import {Observable} from "rxjs";
import {JoiValidationPipe} from "@teams/validators";
import {LoginRequest} from "../dto/login.requests";
import {LoginService} from "../services/login.service";
import {AuthHeaderInterceptor} from "../../providers/interceptors/auth-header.interceptor";

@Controller('/login')
export class LoginController {

  @Inject(LoginService) service: LoginService

  @Post('/:id')
  @UseInterceptors(AuthHeaderInterceptor)
  login(@Body(new JoiValidationPipe(LoginRequest)) req: LoginRequest,
        @Param() {id}: { id: string }): Observable<{ id: string, password: string, success: boolean }> {
    return this.service.canLogin(id, req.password);
  }
}
