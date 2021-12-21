import http from "http";
import https = require("https");
import { IHttpResponse, TCustomErrorCode } from "./models/client-response";

/**
 * http request class
 * provide send request
 */
export class HttpRequest {
  public async send(
    options: http.RequestOptions,
    data?: any
  ): Promise<IHttpResponse> {
    let result: string = "";

    return new Promise<IHttpResponse>((resolve, reject) => {
      // todo pass an array of ports for https
      let requestAgent = options.port === 443 ? https : http;

      const req: http.ClientRequest = requestAgent.request(options, (res) => {
        res.on("data", (chunk) => {
          result += chunk;
        });

        res.on("error", (err) => {
          const response: IHttpResponse = {
            error: err.message,
            errorCode: TCustomErrorCode.RespError,
            httpCode: res.statusCode,
          };
          reject(response);
        });

        res.on("end", () => {
          const response: IHttpResponse = {
            response: result,
            httpCode: res.statusCode,
          };

          res.statusCode === 200 ? resolve(response) : reject(response);
        });
      });

      /***
       * handles the errors on the request
       */
      req.on("error", (err) => {
        const response: IHttpResponse = {
          error: err.message,
          errorCode: TCustomErrorCode.ReqError,
        };
        reject(response);
      });

      /***
       * handles the timeout error
       */
      req.on("timeout", () => {
        const response: IHttpResponse = {
          error: "timeout",
          errorCode: TCustomErrorCode.TimeoutError,
        };
        reject(response);
        //req.destroy();
      });

      /***
       * unhandle errors on the request
       */
      req.on("uncaughtException", () => {
        const response: IHttpResponse = {
          error: "uncaughtException",
          errorCode: TCustomErrorCode.UncaughtException,
        };
        reject(response);
      });

      /**
       * adds the payload/body
       */
      if (data) {
        const body = JSON.stringify(data);
        req.write(body);
      }

      /**
       * end the request to prevent ECONNRESET and socket hung errors
       */
      req.end(() => {
        //  console.log("request ends");
      });
    });
  }
}
