/* eslint-disable @typescript-eslint/no-explicit-any */
import * as mongoose from 'mongoose'
import {AggregateOptions, Model, PipelineStage, QueryOptions, UpdateQuery} from 'mongoose'
import * as mongodb from 'mongodb'
import {ObjectId} from 'mongodb'
import {BaseDocument} from '../schema/base.document'
import {catchError, forkJoin, map, mergeMap, Observable, of, throwError} from 'rxjs'
import {getManyPaginated, paginatedFiltersToPipeline} from '../utils/mongo-query-utils'
import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common'
import {DeleteResult, UpdateResult} from '../entities/mongo-results'
import {PaginatedFilters} from '../filters/paginated-filters'
import {PaginatedEntityResponse} from "../entities/paginated-entity.response";
import {fromPromise} from "@teams/utils";

@Injectable()
export class MongoUtils {

  //region insert
  insertOneAndGet<T extends BaseDocument, D extends BaseDocument, F>(model: Model<T>, entity: D): Observable<F> {
    if (!entity._id) {
      entity._id = new ObjectId().toHexString()
    }
    const date = new Date()
    entity.updatedAt = date;
    entity.createdAt = date;
    return fromPromise(model.findOneAndUpdate({_id: entity._id}, entity, {
      returnDocument: 'after',
      upsert: true
    }).exec()).pipe(
      map(item => item.toObject()))
  }

  insertOne<T extends BaseDocument>(model: Model<T>, entity: T): Observable<any> {
    if (!entity._id) {
      entity._id = new ObjectId().toHexString()
    }
    const date = new Date()
    entity.updatedAt = date
    entity.createdAt = date


    return fromPromise(model.create(entity)).pipe(
      map(item => item.toObject())
    )
  }

  insertMany<T extends BaseDocument, D extends BaseDocument>(model: Model<T>, entities: D[]): Observable<any> {
    entities.forEach((entity) => {
      if (!entity._id) {
        entity._id = new ObjectId().toString()
        entity.createdAt = new Date()
        entity.updatedAt = new Date()
      }
    })
    return fromPromise(model.insertMany(entities));
  }

  //endregion

  //region get
  findOne<T extends BaseDocument>(
    model: Model<T>,
    filter: mongoose.FilterQuery<T>,
    projection?: mongoose.ProjectionType<T> | null | undefined,
  ): Observable<T> {
    return fromPromise(model.findOne(filter, projection).exec()).pipe(
      mergeMap((item) => {
        if (!item) {
          return throwError(() => new NotFoundException('messages.notFound'))
        }
        return of(item.toObject())
      }),
    )
  }

  countDocuments<T extends BaseDocument>(model: Model<T>, filter: mongoose.FilterQuery<T>): Observable<number> {
    return fromPromise(model.countDocuments(filter).exec());
  }

  findOneAndDelete<T extends BaseDocument, D>(model: Model<T>, filter?: mongoose.FilterQuery<T>): Observable<D> {
    return fromPromise(model.findOneAndDelete(filter).exec()).pipe(
      mergeMap((item) => {
        if (!item) {
          return throwError(() => new NotFoundException('messages.notFound'))
        }
        return of(item.toObject())
      }),
    )
  }

  deleteMany<T extends BaseDocument>(model: Model<T>, filter?: mongoose.FilterQuery<T>): Observable<DeleteResult> {
    return fromPromise(model.deleteMany(filter).exec()).pipe(
      map((deleteResult) => {
        const response = new DeleteResult()
        response.deleteCount = deleteResult?.deletedCount || 0
        return response
      }),
    )
  }

  findOneById<T extends BaseDocument>(model: Model<T>, id: string): Observable<T> {
    return fromPromise(model.findById(id).exec()).pipe(
      mergeMap((item) => {
        if (!item) {
          return throwError(() => new NotFoundException('messages.notFound'))
        }
        return of(item)
      }),
    )
  }

  findMany<T extends BaseDocument>(
    model: Model<T>,
    filter: mongoose.FilterQuery<T>,
    projection?: mongoose.ProjectionType<T> | null | undefined,
    options?: QueryOptions<T>
  ): Observable<T[]> {
    return fromPromise(model.find(filter, projection, options).exec()).pipe(
      map(items => items?.map(i => i.toObject()))
    );
  }

  getManyPaginated<T extends BaseDocument, D>(
    model: Model<T>,
    filters: mongoose.FilterQuery<T>[],
    paginatedFilters: PaginatedFilters,
    additionalPipeline: PipelineStage[] = null,
    searchFields: string[] = null,
    options?: AggregateOptions
  ): Observable<PaginatedEntityResponse<D>> {

    const dataPipeline = getManyPaginated(filters, paginatedFilters, additionalPipeline, searchFields).concat(...paginatedFiltersToPipeline(paginatedFilters));
    const countPipeline = getManyPaginated(filters, paginatedFilters, additionalPipeline, searchFields).concat({$count: 'count'})

    return forkJoin([this.aggregate(model, dataPipeline, {allowDiskUse: true, ...(options || {})}), this.aggregate(model, countPipeline, {...(options || {})})]).pipe(
      map(([data, countR]) => {
          const count: number = parseInt(countR[0]?.['count']) || 0;
          const currentPage = parseInt(String(paginatedFilters?.page)) || 0;
          const limit = parseInt(String(paginatedFilters?.limit)) || 0;
          return {
            count, limit, data: data as D[], currentPage: Math.max(currentPage, 0),
            pageCount: limit === 0 ? 0 : Math.ceil((count / paginatedFilters.limit) as number),
          }
        }
      ));
  }

  //endregion

  //region aggregate
  aggregate<T, D>(model: Model<T>, pipeline: PipelineStage[], options?: mongodb.AggregateOptions): Observable<D[]> {
    return fromPromise(model.aggregate(pipeline, options).exec()).pipe(
      map((item: any[]) => item.map((i) => i as D)),
      catchError(err => {
        //{allowDiskUse: true}
        if (err?.code === 292) {
          return throwError(() => new InternalServerErrorException("messages.somethingWrong"))
        }
        return throwError(err);
      })
    )
  }

  //endregion

  //region update
  updateOne<T extends BaseDocument>(model: Model<T>, filter: mongoose.FilterQuery<T>, update: mongoose.UpdateQuery<T>): Observable<UpdateResult> {
    const date = new Date()
    update['$set'] = {...update['$set'], ...{updatedAt: new Date()}}
    const finalUpdate = {
      ...update,
      ...{
        $setOnInsert: {
          createdAt: date,
        },
      },
    };


    return fromPromise(model.updateOne(filter, finalUpdate).exec()).pipe(
      map((result) => {
        const response = new UpdateResult()
        response.matchedCount = result?.matchedCount || 0
        response.modifiedCount = result?.modifiedCount || 0
        return response
      }),
    )
  }

  updateMany<T extends BaseDocument>(
    model: Model<T>,
    filter: mongoose.FilterQuery<T>,
    update: mongoose.UpdateQuery<T>,
  ): Observable<any> {

    const date = new Date()
    update['$set'] = {...update['$set'], ...{updatedAt: new Date()}}
    const finalUpdate = {
      ...update,
      ...{
        $setOnInsert: {
          createdAt: date,
        },
      },
    };

    return fromPromise(model.updateMany(filter, finalUpdate).exec());
  }

  updateManyWithPipeline<T extends BaseDocument>(
    model: Model<T>,
    filter: mongoose.FilterQuery<T>,
    update: mongoose.UpdateWithAggregationPipeline,
  ): Observable<UpdateResult> {

    const finalUpdate = this.updateWithPipelineAdditionalFields(update);
    return fromPromise(model.updateMany(filter, finalUpdate).exec()).pipe(
      map((result) => {
        const response = new UpdateResult()
        response.matchedCount = result?.matchedCount || 0
        response.modifiedCount = result?.modifiedCount || 0
        return response
      }),
    )
  }

  updateOneAndGet<T extends BaseDocument, D extends BaseDocument, F>(
    model: Model<T>,
    entity: D,
    id: string
  ): Observable<F> {
    entity.updatedAt = new Date();
    return fromPromise(model.findOneAndUpdate({_id: id}, entity, {
      returnDocument: 'after',
      upsert: false
    }).exec()).pipe(map(item => item as unknown as F))
  }

  updateDocumentAndGet<T extends BaseDocument, F>(
    model: Model<T>,
    filter: mongoose.FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
  ): Observable<F> {
    return fromPromise(model.findOneAndUpdate(filter, updateQuery, {
      returnDocument: 'after',
      upsert: false
    }).exec()).pipe(map(item => item as unknown as F))
  }

  private updateWithPipelineAdditionalFields(update: mongoose.UpdateWithAggregationPipeline): mongoose.UpdateWithAggregationPipeline {
    const date = new Date();
    const addAdditionalFields = [
      {
        $set: {
          updatedAt: date,
          createdAt: {
            $cond: [
              {
                $eq: [
                  {
                    $type: '$createdAt',
                  },
                  'missing',
                ],
              },
              date,
              '$createdAt',
            ],
          },
        },
      },
    ]
    return [].concat(update, addAdditionalFields)
  }

  //endregion

  //region replace
  replace<T extends BaseDocument>(model: Model<T>, _id: string, entity: T): Observable<T> {
    return fromPromise(model.findOneAndReplace({_id}, entity, {upsert: true}).exec())
      .pipe(map(i => i as T));
  }

  //endregion

  //region delete
  deleteById<T extends BaseDocument>(model: Model<T>, id: string): Observable<DeleteResult> {
    return fromPromise(model.deleteOne({_id: id}).exec()).pipe(
      map((deleteResult) => {
        const response = new DeleteResult()
        response.deleteCount = deleteResult?.deletedCount || 0
        return response
      }),
    )
  }

  deleteOne<T extends BaseDocument>(model: Model<T>, filter?: mongoose.FilterQuery<T>): Observable<DeleteResult> {
    return fromPromise(model.deleteOne(filter).exec()).pipe(
      map((deleteResult) => {
        const response = new DeleteResult();
        response.deleteCount = deleteResult?.deletedCount || 0
        return response
      }),
    )
  }

//endregion
}
