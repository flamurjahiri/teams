import {Inject} from '@nestjs/common';
import {Options} from "../entities/client-rpc.options";

export const options: Options[] = [];

export function RPCClient(currOption?: Options) {
  if (!options?.includes(currOption)) {
    options.push(currOption);
  }
  return Inject(`RPC-${currOption.name}`);
}
