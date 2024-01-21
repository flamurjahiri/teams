import {Request} from "express"
import {User} from "../../users/entities/users.schema";
import {UserSimple} from "../../users/dto/user.simple";

export interface HttpRequest extends Request {
  id: string;
  user: User;
  userSimple: UserSimple


}


export const setReqData = (req: HttpRequest, user: User): void => {
  req.id = user._id;
  req.user = user;
  req.userSimple = new UserSimple(user);
}
