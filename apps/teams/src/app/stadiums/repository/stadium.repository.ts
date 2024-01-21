import {Inject, Injectable} from "@nestjs/common";
import {Stadium} from "../entities/stadium.schema";
import {Observable} from "rxjs";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {DEFAULT_DATABASE_CONN} from "../../../assets/config.options";
import {DeleteResult, MongoUtils, PaginatedEntityResponse, PaginatedFilters} from "@teams/database";
import {HttpRequest} from "../../auth/entities/custom-request.interface";
import {StadiumPaginatedRequest, toFilters} from "../dto/stadium.paginated.request";

@Injectable()
export class StadiumRepository {
  @Inject(MongoUtils) mongoUtils: MongoUtils
  @InjectModel(Stadium.name, DEFAULT_DATABASE_CONN) model: Model<Stadium>

  insert(stadium: Stadium): Observable<Stadium> {
    return this.mongoUtils.insertOne(this.model, stadium);
  }

  getById(id: string): Observable<Stadium> {
    return this.mongoUtils.findOneById(this.model, id);
  }

  getUserStadium(req: HttpRequest, paginatedFilters: PaginatedFilters, filters: StadiumPaginatedRequest, ownStadium: boolean): Observable<PaginatedEntityResponse<Stadium>> {
    return this.mongoUtils.getManyPaginated(this.model, toFilters(req, filters, ownStadium), paginatedFilters, [], ['name', 'city', 'country']);
  }

  getCloseStadiums(req: HttpRequest, paginatedFilters: PaginatedFilters, city: string): Observable<PaginatedEntityResponse<Stadium>> {
    const filters = [];
    if (city) {
      filters.push({city});
    }

    return this.mongoUtils.getManyPaginated(this.model, filters, paginatedFilters, [], ['name', 'city', 'country']);
  }

  deleteById(id: string): Observable<DeleteResult> {
    return this.mongoUtils.deleteById(this.model, id);
  }

}
