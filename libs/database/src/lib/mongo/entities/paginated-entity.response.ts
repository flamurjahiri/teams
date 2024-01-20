export class PaginatedEntityResponse<T> {
  data: T[]
  count = 0
  currentPage = 0
  pageCount = 0
  limit = 0

  constructor(data?: T[], limit?: number) {
    this.data = data;
    if (limit) {
      this.limit = limit;
    }
  }
}
