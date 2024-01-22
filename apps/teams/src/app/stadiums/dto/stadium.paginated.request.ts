import {DynamicFilter, getIds} from "../../base/entities/dynamic-filter";
import {any, array, number} from "joiful";
import {HttpRequest} from "../../auth/entities/custom-request.interface";
import mongoose from "mongoose";
import {Stadium} from "../entities/stadium.schema";
import dayjs from "dayjs";
import {GET_DAY} from "../../utils-global/utils";
import {BadRequestException} from "@nestjs/common";

export class StadiumPaginatedRequest {
  @array({elementClass: DynamicFilter}).optional()
  city: DynamicFilter[]

  @array({elementClass: DynamicFilter}).optional()
  country: DynamicFilter[]

  @any().custom(({joi}) => joi.custom(val => dayjs(val).toDate())).optional()
  date: Date;

  @number().optional()
  from: number

  @number().optional()
  to: number

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

  if (filters.date) {
    const day = dayjs(filters.date).day();

    res.push({workingDays: GET_DAY(day)});
  }

  if (filters.from && filters.to) {
    if (filters.from > filters.to) {
      throw new BadRequestException("You can't choose from to be greater than to");
    }

    res.push({closesAt: {$lte: filters.from}});
    res.push({openAt: {$gte: filters.to}});
  }

  return res;
}
