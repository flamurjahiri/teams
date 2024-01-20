import {Options} from "./client-rpc.options";
import {HttpStatus, Provider} from "@nestjs/common";
import {ClientGrpcProxy} from "@nestjs/microservices";
import {options} from "../services/rpc.decorator";
import {status as Status} from "@grpc/grpc-js";

export function createRPCConnections() {
  return options?.map(i => createClientRpcProvider(i));
}

function createClientRpcProvider<T>(options: Options): Provider<T> {
  return {
    provide: `RPC-${options.name}`,
    useFactory: () => clientRPCFactory(options),
  }
}

const channelOptions = {
  // Send keepalive pings every 6 minutes, default is none.
  // Must be more than GRPC_ARG_HTTP2_MIN_RECV_PING_INTERVAL_WITHOUT_DATA_MS on the server (5 minutes.)
  'grpc.keepalive_time_ms': 6 * 60 * 1000,
  // Keepalive ping timeout after 5 seconds, default is 20 seconds.
  'grpc.keepalive_timeout_ms': 5 * 1000,
  // Allow keepalive pings when there are no gRPC calls.
  'grpc.keepalive_permit_without_calls': 1,
};


function clientRPCFactory<T>(options: Options): T {
  if (!options?.options?.channelOptions) {
    options.options.channelOptions = channelOptions;
  }

  return new ErrorHandlingGrpcClient({...options.options}).getService<T>(options.name);
}


class ErrorHandlingGrpcClient extends ClientGrpcProxy {
  protected serializeError(err: any): any {
    err.code = HTTP_CODE_FROM_GRPC[err.code] || 500;
    err.message = err.details;
    return err;
  }
}

const HTTP_CODE_FROM_GRPC: Record<number, number> = {
  [Status.OK]: HttpStatus.OK,
  [Status.CANCELLED]: HttpStatus.METHOD_NOT_ALLOWED,
  [Status.UNKNOWN]: HttpStatus.BAD_GATEWAY,
  [Status.INVALID_ARGUMENT]: HttpStatus.UNPROCESSABLE_ENTITY,
  [Status.DEADLINE_EXCEEDED]: HttpStatus.REQUEST_TIMEOUT,
  [Status.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [Status.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [Status.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [Status.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
  [Status.FAILED_PRECONDITION]: HttpStatus.PRECONDITION_REQUIRED,
  [Status.ABORTED]: HttpStatus.METHOD_NOT_ALLOWED,
  [Status.OUT_OF_RANGE]: HttpStatus.PAYLOAD_TOO_LARGE,
  [Status.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
  [Status.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
  [Status.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [Status.DATA_LOSS]: HttpStatus.INTERNAL_SERVER_ERROR,
  [Status.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
};

