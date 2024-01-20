import {join} from "path";

export const DEFAULT_DATABASE_CONN = "DATABASE";


export const NOTIFICATION_SERVICE = {
  url: `${process.env.NOTIFICATION_SERVICE}:${process.env.NOTIFICATION_SERVICE}`,
  package: 'notifications',
  protoPath: join(__dirname, '../../../apps/teams/src/app/protos/notifications.proto')
}
