import {Body, Controller, Inject, Param, Post} from "@nestjs/common";
import {Observable} from "rxjs";
import {JoiValidationPipe} from "@teams/validators";
import {LoginRequest} from "../dto/login.requests";
import {LoginService} from "../services/login.service";

@Controller('/login')
export class LoginController {

  @Inject(LoginService) service: LoginService

  @Post('/:id')
  login(@Body(new JoiValidationPipe(LoginRequest)) req: LoginRequest,
        @Param() {id}: { id: string }): Observable<boolean> {
    return this.service.canLogin(id, req.password);
  }
}
