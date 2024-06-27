/* eslint-disable */
//region init classes

import {set, unset} from "./augmentation.utils";

type ArrayProjection = string | boolean

class PaginatedFilters {
  page?: number
  limit?: number
  asc?: string
  dsc?: string
  q?: string
  fields?: string

  excludeFields?: string[]
}

class PaginatedEntity<T> {
  data: T[]
  count: number
  currentPage: number
  pageCount: number
  limit: number

}

//endregion

export {}


declare global {
  interface Array<T> {
    orderBy(sortBy: { key: string, type: 'asc' | 'dsc' }[]): Array<T>

    groupBy<T extends { [k: string]: any }, K extends { [k: string]: string }>(groupBy: K): {
      type: { [A in keyof K]: unknown };
      values: T[]
    }[]

    group(key: string): Map<string, T[]>

    distinct(key?: string): Array<T>

    project(data: { [k: string]: ArrayProjection | { val: ArrayProjection, default: any } }): Array<T>

    fields(fields: string[]): Array<T>

    add(index: number, entity: T): Array<T>

    paginateList(paginatedFilters: PaginatedFilters, searchFields?: string[]): PaginatedEntity<T>

    partition(numberOfElements: number): T[][];
  }
}


Array.prototype.orderBy = function <T>(this: T[], sortBy: {
  key: string,
  type: 'asc' | 'dsc'
}[]): Array<T> {

  const getTypeValue = (type: 'asc' | 'dsc') => {

    if (type === 'asc') {
      return 1;
    }

    return -1;
  }

  return this?.sort((lhs, rhs) =>
    sortBy.filter(i => !!i.key).reduce((a, v) =>
        a || getTypeValue(v.type) * `${getValueAtKey(lhs, v.key)}`.localeCompare(`${getValueAtKey(rhs, v.key)}`, 'en', {numeric: true})
      , 0))
}

Array.prototype.groupBy = function <T extends { [k: string]: any }, K extends {
  [k: string]: string
}>(this: T[], groupBy: K): { type: { [A in keyof K]: unknown }; values: T[] }[] {
  return this?.reduce((a1, item: T) => {
    const type: { [A in keyof K]: unknown } = Object.entries(groupBy).reduce(
      (a2, [key, value]) => {
        a2[key as keyof K] = value
          .split('.')
          .reduce((a3, v) => (a3 || {})[v], item);
        return a2;
      },
      {} as { [A in keyof K]: unknown }
    );

    const _ =
      a1
        .find((e) =>
          Object.entries(type).reduce(
            (a4, [key, value]) => a4 && e.type[key] === value,
            true
          )
        )
        ?.values.push(item) || a1.push({type: type, values: [item]});

    return a1;
  }, []);
}

Array.prototype.group = function <T>(this: T[], key: string): Map<string, T[]> {
  return this?.reduce((result, val) => {
    const value = key.split('.').reduce((r, v) => r?.[v], val)
    result.set(value, (result.get(value) || []).concat([val]))
    return result;
  }, new Map<string, T[]>) || new Map<string, T[]>
}

Array.prototype.distinct = function <T>(this: T[], key?: string): T[] {
  return this?.filter((item, index, array) => {
    if (key) {
      return array.findIndex(i => getValueAtKey(i, key) === getValueAtKey(item, key)) === index;
    }
    return array.findIndex(i => i === item) === index;
  })
}

Array.prototype.fields = function <T>(this: T[], fields: string[]): Array<T> {
  return this?.filter(i => !!i).map(item => fields.reduce((r, v) => {
    const value = getValueAtKey(item, v);
    if (value) {
      set(r, v, value);
    }
    return r;
  }, {}) as T);
}

Array.prototype.project = function <T>(this: T[], data: {
  [k: string]: ArrayProjection | { val: ArrayProjection, default: any }
}): T[] {

  return this?.filter(i => !!i)
    .map(item =>
      projectFilter(item, {}, data,
        (value) => !!value && ((typeof value === 'boolean' && value) || (typeof value === 'string')),
        (k, v) => typeof v === 'boolean' ? getValueAtKey(item, k) : v.startsWith('$') ? getValueAtKey(item, v.substring(1)) : v,
        (r, k, value) => set(r, k, value))
    )
    .map(item =>
      projectFilter(item, item, data,
        (value) => !!value && typeof value === 'boolean' && !value,
        (k) => getValueAtKey(item, k),
        (r, k) => unset(r, k))
    ) as T[]

}

Array.prototype.add = function <T>(this: T[], index: number, entity: T): Array<T> {
  if (!this?.length) {
    return [entity];
  }
  return [...this.slice(0, index),
    // inserted item
    entity,
    // part of the array after the specified index
    ...this.slice(index)];
}

Array.prototype.paginateList = function <T>(this: T[], paginatedFilters: PaginatedFilters, searchFields?: string[]): PaginatedEntity<T> {
  const limit = parseInt(String(paginatedFilters.limit || 0));
  const count = this?.length || 0;
  const currentPage = parseInt(String(paginatedFilters.page || 0));
  const skip = limit * currentPage;

  const filteredData = this?.filter(item => {
    if (!searchFields?.length || !paginatedFilters.q) {
      return !!item;
    }
    return searchFields
      .map(fields => getValueAtKey(item, fields))
      .some(item => !!item && (item == paginatedFilters.q || `${item}`.toLowerCase().includes(paginatedFilters.q.toLowerCase())));
  }).orderBy([
    {key: paginatedFilters.asc, type: 'asc'},
    {key: paginatedFilters.dsc, type: 'dsc'},
    {key: '_id', type: 'asc'}
  ]).slice(skip, skip + limit);

  return ({
    count, limit, currentPage, data: filteredData, pageCount: limit === 0 ? 0 : Math.ceil((count / limit) as number)
  });
}

Array.prototype.partition = function <T>(this: T[], n: number): T[][] {
  return this.length ? [this.splice(0, n)].concat(this.partition(n)) : [];
}

const getValueAtKey = (obj: any, k: string) => {
  return k?.split('.')?.reduce((a, v) => a?.[v], obj);
}


/**
 *
 * @param item - current item
 * @param startWith - in reduce start with (for set we start with {}, for unset we start with item }
 * @param data - projection data
 * @param predicate - filter which @data are applicable to the current item
 * @param getValueFunction - get value for item
 * @param arrayFunction - set or unset function
 */
function projectFilter<T>(item: T, startWith: T, data: {
                            [k: string]: ArrayProjection | { val: ArrayProjection, default: any }
                          },
                          predicate: (value) => boolean, getValueFunction: (k, v) => string, arrayFunction: (r, k, value) => void): T {

  //find if we have any data that matches the predicate (include fields, or exclude fields)
  const predicated = Object.entries(data)
    .filter(i => !!i)
    .filter(([_, value]) => predicate(typeof value === 'object' ? value.val : value));

  if (!predicated?.length) {
    return item;
  }

  return predicated
    .reduce((r, [k, v]) => {
      const value = getValueFunction(k, typeof v === 'object' ? v.val : v);

      if (value) {
        arrayFunction(r, k, value);
      } else if (v?.['default']) {
        arrayFunction(r, k, v['default'])
      }
      return r;
    }, startWith);
}

