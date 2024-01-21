import {DynamicFilter, getIds} from "../../base/entities/dynamic-filter";
import {array} from "joiful";
import {HttpRequest} from "../../auth/entities/custom-request.interface";
import mongoose from "mongoose";
import {Stadium} from "../entities/stadium.schema";

export class StadiumPaginatedRequest {
  @array().optional()
  city: DynamicFilter[]

  @array().optional()
  country: DynamicFilter[]


}


export const toFilters = (req: HttpRequest, filters: StadiumPaginatedRequest, filterOwn: boolean): mongoose.FilterQuery<Stadium>[] => {
  const res: mongoose.FilterQuery<Stadium>[] = [];

  if (filterOwn) {
    res.push({"createdBy._id": req.id});
  }


  const cities = getIds(filters?.city);
  if (cities?.length) {
    res.push({'city': {$in: cities}});
  }

  const countries = getIds(filters?.country);
  if (countries?.length) {
    res.push({'country': {$in: countries}});
  }

  return res;
}
