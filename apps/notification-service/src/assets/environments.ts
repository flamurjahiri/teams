import process from "process";


//region twilio
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
export const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID;
//endregion

//region sendgrid
export const SENDGRID_DEFAULT_EMAIL = process.env.SENDGRID_DEFAULT_EMAIL;
export const SENDGRID_DEFAULT_NAME = process.env.SENDGRID_DEFAULT_NAME;
export const SENDGRID_URL = process.env.SENDGRID_URL;
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;


//endregion

//region grpc
export const GRPC_HOST = process.env.GRPC_HOST;
export const GRPC_PORT = process.env.GRPC_PORT;

//endregion
