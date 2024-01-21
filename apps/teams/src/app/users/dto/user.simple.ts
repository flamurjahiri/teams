import {User} from "../entities/users.schema";

export class UserSimple {
  _id: string;
  firstName: string;
  lastName: string;


  constructor(user: User) {
    this._id = user._id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }
}
