import mongoose, {PipelineStage} from 'mongoose'
import {PaginatedFilters} from '../filters/paginated-filters'

export function getManyPaginated<T>(
  filter: mongoose.FilterQuery<T>[],
  paginatedFilters: PaginatedFilters,
  additionalPipeline: PipelineStage[],
  searchFields: string[],
): PipelineStage[] {
  const pipeline = []
  if (additionalPipeline?.length) {
    pipeline.push(...additionalPipeline)
  }

  if (filter?.length) {
    pipeline.push({$match: {$and: filter}})
  }

  if (paginatedFilters?.search && searchFields?.length) {
    pipeline.push({$match: searchFilters(paginatedFilters, searchFields)})
  }
  return pipeline;
}

export const paginatedFiltersToPipeline = (paginatedFilters: PaginatedFilters): PipelineStage[] => {
  const pipeline: PipelineStage[] = []
  const limitNumber: number = parseInt(String(paginatedFilters.limit));
  const pageNumber: number = parseInt(String(paginatedFilters.page));

  const include = paginatedFilters?.project ? 1 : 0;
  const project = (paginatedFilters?.project?.split(',') || paginatedFilters?.excludeFields || [])?.reduce((a, v) => {
    a[v] = include;
    return a;
  }, {});

  if (Object.keys(project)?.length) {
    pipeline.push({$project: project});
  }
  const sort =
    (paginatedFilters.sort || []).filter(a => (a.startsWith("-") || a.startsWith("+")) && a.split(" ").length === 1).reduce((a, v) => {
      if (v.startsWith("+")) {
        a[v.split("+")[1]] = 1;
      } else {
        a[v.split("-")[1]] = -1;
      }
      return a;
    }, {});


  //allow sorting on _id
  if (!sort['_id']) {
    sort['_id'] = 1;
  }
  pipeline.push({$sort: sort})

  const skip: number = limitNumber * pageNumber
  if (skip > 0) {
    pipeline.push({$skip: skip})
  }

  if (limitNumber > 0) {
    pipeline.push({$limit: limitNumber})
  }

  return pipeline;
}

export const searchFilters = (paginatedFilters: PaginatedFilters, searchFields: string[]) => {
  if (!(paginatedFilters?.search && searchFields?.length)) {
    return null;
  }

  const orFilters = searchFields.reduce((a, v) => {
    a.push({[v]: new RegExp(paginatedFilters.search, 'i')});
    return a;
  }, []);

  return {$or: orFilters};
}

