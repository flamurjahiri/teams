export class DeleteResult {
  deleteCount: number
}

export class UpdateResult {
  modifiedCount: number
  matchedCount: number
  upsertedId?: string
}

export class BulkWriteResult {
  deletedCount: number
  insertedCount: number
  modifiedCount: number
  matchedCount: number
  upserts: string[]
}
