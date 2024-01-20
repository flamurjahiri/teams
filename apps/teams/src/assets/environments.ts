import process from "process";

//region mongo
export const MONGO_CONNECTION_URL: string = `${process.env.MONGO_DB_CONNECTION_URL}`;
export const MONGO_DATABASE: string = `${process.env.MONGO_DB_NAME}`;
//endregion


//region utils
export const MAX_REQUEST_TIME = Number(process.env.MAX_REQUEST_TIME_SECONDS) || 2;
//endregion
