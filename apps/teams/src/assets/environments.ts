import process from "process";

//region mongo
export const MONGO_CONNECTION_URL: string = `${process.env.MONGO_DB_CONNECTION_URL}`;
export const MONGO_DATABASE: string = `${process.env.MONGO_DB_NAME}`;
//endregion


//region notification
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const EMAIL_NAME = process.env.EMAIL_NAME;
export const EMAIL_TEMPLATE_ID = process.env.EMAIL_TEMPLATE_ID;

//endregion

export const SERVICE_URL = process.env.SERVICE_URL;

//region utils
export const MAX_REQUEST_TIME = Number(process.env.MAX_REQUEST_TIME_SECONDS) || 2;
//endregion

export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
