import {array, number} from "joiful";
import {stringify} from "@teams/validators";

export class PaginatedFilters {
  @number().default(-1).optional()
  page?: number
  @number().default(100).optional()
  limit?: number
  @array().optional()
  sort: string[]
  @stringify().optional()
  search?: string
  @stringify().optional()
  project?: string

  excludeFields : string[]
}
