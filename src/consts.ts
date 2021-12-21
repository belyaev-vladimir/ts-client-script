import http from "https";

export const MAX_DEEP_RETRY = 8;
export const POLLING_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 10 * 1000; //10 seconds
const TARGET_URL = "google.com";
const SERVER_URL = "127.0.0.1";
const SERVER_PORT = 8080;
const SERVER_PATH = "/data";

/**
 * define the target request options
 */
export const TARGET_OPTION: http.RequestOptions = {
  hostname: TARGET_URL,
  method: "GET",
  path: "/",
  port: 443,
  headers: {
    Accept: "text/html",
    // "Cache-Control": "no-cache",
  },
  timeout: REQUEST_TIMEOUT,
};

/**
 * define the server request options
 */
export const SERVER_OPTION: http.RequestOptions = {
  hostname: SERVER_URL,
  method: "POST",
  path: SERVER_PATH,
  port: SERVER_PORT,
  rejectUnauthorized: false,
  headers: {
    Accept: "text/html",
  },
  timeout: REQUEST_TIMEOUT,
};
