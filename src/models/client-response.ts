export enum TCustomErrorCode {
  RespError,
  ReqError,
  TimeoutError,
  UncaughtException,
}

export interface IHttpResponse {
  response?: string;
  error?: string;
  httpCode?: number;
  errorCode?: TCustomErrorCode;
}
