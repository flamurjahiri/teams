import { Inject } from '@nestjs/common';
import { NEO_4J_CONNECTION_DRIVER, NEO_4J_DATABASE, NEO_4J_HEALTH_CHECK } from '../assets/constants';


export function InjectDatabase(database: string, connectionName?: string) {
  return Inject(NEO_4J_DATABASE(database, connectionName));
}

export function InjectDriver(connectionName?: string) {
  return Inject(NEO_4J_CONNECTION_DRIVER(connectionName));
}

export function InjectHealth(connectionName?: string) {
  return Inject(NEO_4J_HEALTH_CHECK(connectionName));
}
