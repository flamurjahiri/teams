import {Inject, Injectable} from "@nestjs/common";
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {User} from "../entities/users.schema";
import {DeleteResult, MongoUtils, PaginatedEntityResponse, PaginatedFilters, UpdateResult} from "@teams/database";
import {DEFAULT_DATABASE_CONN} from "../../../assets/config.options";
import {map, Observable} from "rxjs";

@Injectable()
export class UserRepository {
  //region injections
  @Inject(MongoUtils) private readonly mongoUtils: MongoUtils
  @InjectModel(User.name, DEFAULT_DATABASE_CONN) private readonly userModel: Model<User>
  //endregion


  //region insert
  createUser(user: User): Observable<User> {
    return this.mongoUtils.insertOne(this.userModel, user);
  }

  //endregion

  //region get
  getById(id: string): Observable<User> {
    return this.mongoUtils.findOneById(this.userModel, id);
  }

  getUsers(paginatedFilters: PaginatedFilters): Observable<PaginatedEntityResponse<User>> {
    return this.mongoUtils.getManyPaginated(this.userModel, [], paginatedFilters, [], ['username', 'firstName', 'lastName', 'email'])
      .pipe(
        map(r => (
          {
            ...r,
            data: (r.data || []).project({password: false}) as User[]
          }))
      );
  }

  getByEmailOrNumber(email: string, phoneNumber: string): Observable<User[]> {
    return this.mongoUtils.findMany(this.userModel, {$or: [{email}, {phoneNumber}]});
  }

  //endregion

  //region delete
  delete(id: string): Observable<DeleteResult> {
    return this.mongoUtils.deleteById(this.userModel, id);
  }

  //endregion


  //region update
  validate(_id: string, type: "PHONE" | "EMAIL"): Observable<UpdateResult> {

    const update = type === "PHONE" ? {'validated.phoneNumber': true} : {'validated.email': true}

    return this.mongoUtils.updateOne(this.userModel, {_id}, {$set: {...update}, $unset: {expiresAt: ''}})
  }

  //endregion
}
