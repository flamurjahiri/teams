import {Request} from "express"
import {User} from "../../users/entities/users.schema";
import {UserSimple} from "../../users/dto/user.simple";

export interface HttpRequest extends Request {
  id: string;
  user: User;
  userSimple: UserSimple
}
