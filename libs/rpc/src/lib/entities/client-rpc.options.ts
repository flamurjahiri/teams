import {GrpcOptions} from "@nestjs/microservices/interfaces";

export class Options {
  options: GrpcOptions['options']
  name: string
}
