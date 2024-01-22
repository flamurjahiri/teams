import {join} from "path";
import process from "process";

export const DEFAULT_DATABASE_CONN = "DATABASE";

export const MONGO_CONNECTION_URL: string = `${process.env.MONGO_DB_CONNECTION_URL}`;
export const MONGO_DATABASE: string = `${process.env.MONGO_DB_NAME}`;

export const NOTIFICATION_SERVICE = {
  url: `${process.env.NOTIFICATION_SERVICE}:${process.env.NOTIFICATION_SERVICE}`,
  package: 'notifications',
  protoPath: join(__dirname, '../../../apps/teams/src/app/protos/notifications.proto')
}
