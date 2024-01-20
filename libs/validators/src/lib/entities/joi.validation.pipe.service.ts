import {ArgumentMetadata, BadRequestException, PipeTransform} from '@nestjs/common';
import {validateAsClass} from 'joiful';
import {Constructor} from 'joiful/core';
import {ValidationOptions} from 'joiful/validation';

export class JoiValidationPipe<T> implements PipeTransform {

  constructor(private validationClass: Constructor<T>, private options?: ValidationOptions) {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
  transform(val: any, metadata: ArgumentMetadata): T {
    if (!this.options) {
      this.options = ({stripUnknown: true});
    }
    const res = validateAsClass(val, this.validationClass, this.options);

    if (res.error || res.errors) {
      throw new BadRequestException(res.error || res.errors);
    }

    return res.value;
  }
}
