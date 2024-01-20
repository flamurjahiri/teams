import {DynamicModule, Global} from "@nestjs/common";
import {createRPCConnections} from "./entities/client-rpc.provider";

@Global()
export class RpcModule {
  static forRoot(): DynamicModule {
    const allProviders = [...createRPCConnections()];
    return {
      module: RpcModule,
      providers: allProviders,
      exports: allProviders
    }
  }
}
