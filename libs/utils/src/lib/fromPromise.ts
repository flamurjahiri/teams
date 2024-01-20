import {defer, from, Observable} from 'rxjs';
import {createInvalidObservableTypeError} from "rxjs/internal/util/throwUnobservableError";


export function fromPromise<T>(promise: PromiseLike<T>): Observable<T> {
  if (promise != null) {
    return defer(() => from(promise));
  }

  throw createInvalidObservableTypeError(promise);
}
