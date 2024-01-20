import {BadRequestException} from "@nestjs/common";

export const set = (obj: any, path: string, value: any): any => {
  if (!obj) {
    throw new BadRequestException("Object is null");
  }
  if (typeof obj !== 'object' || !path) {
    return obj;
  }

  path.split(".").reduce((a, v, i, arr) => {
    if (i === arr.length - 1) {
      if (!a[v]) {
        a[v] = value;
        return a;
      }
      if (typeof a[v] === 'object' && typeof value !== 'object') {
        throw new BadRequestException(`${path} is an object, you want to replace with type: ${typeof value}!`);
      }

      if (typeof a[v] !== 'object' && typeof value === 'object') {
        throw new BadRequestException(`${path} is type: ${typeof a[v]}, you want to replace with an object!`);
      }

      a[v] = value;
      return a;
    }

    if (!a[v]) {
      a[v] = {};
      return a[v];
    }

    if (typeof a[v] !== 'object') {
      throw new BadRequestException(`${v} is not an object, so you can't add proper value to that!`);
    }

    return a[v];
  }, obj);

  return obj;
}


export const unset = (obj: any, path: string): any => {
  if (!obj) {
    throw new BadRequestException("Object is null");
  }

  if (typeof obj !== 'object' || !path) {
    return obj;
  }

  path.split(".").reduce((a, v, i, arr) => {
    if (!a) {
      return;
    }
    if (i === arr.length - 1) {
      if (!a[v]) {
        return;
      }

      delete a[v];
      return a;
    }

    return a[v];
  }, obj);

  return obj;
}
