import { performance } from "perf_hooks";
import { HttpRequest } from "./https-request";
import { IServerStatisticData } from "./models/server-statistic-data";
import { IClientStatisticData } from "./models/client-statistic-data";
import { IHttpResponse, TCustomErrorCode } from "./models/client-response";
import {
  TARGET_OPTION,
  SERVER_OPTION,
  MAX_DEEP_RETRY,
  POLLING_DELAY,
} from "./consts";
import { exitHelper } from "./helper/exit-helper";

let pingId: number = 0;

// initialize client request statistic
let clientStat: IClientStatisticData = {
  requestAll: 0,
  requestOk: 0,
  request500: 0,
  requestTimeout: 0,
};

/**
 * Returns the time of the request to target server.
 * The connection is specified in const "TARGET_OPTION"
 */
let getTargetPagePerformance = async (): Promise<number | null> => {
  try {
    const request = new HttpRequest();

    const tStart = performance.now();
    const resp = await request.send(TARGET_OPTION);
    const tEnd = performance.now() - tStart;

    return resp.httpCode === 200 ? tEnd : null;
  } catch (err) {
    console.log(`error when get target page performance value - ${err}`);
    return null;
  }
};

/**
 * promise to wait "ms" milliseconds
 */
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * This sends data of statistics to the server
 * The connection is specified in const "SERVER_OPTION"
 */
const sendDataToServer = async (
  data: IServerStatisticData
): Promise<IHttpResponse> => {
  const request = new HttpRequest();
  return request.send(SERVER_OPTION, data);
};

/**
 * Sends statistics to the server
 * with an exponential retry delay in case of problems
 */
const sendStatisticToServer = async (
  responseTime: number,
  pingId: number,
  depth = 1
): Promise<void | Error> => {
  try {
    let data: IServerStatisticData = {
      pingId,
      responseTime,
      deliveryAttempt: depth,
      date: Date.now(),
    };

    clientStat.requestAll++;
    console.log(`Attempt to send ${JSON.stringify(data)}`);

    let res = await sendDataToServer(data);

    console.log(`Server answer for pingId(${pingId}) - ${JSON.stringify(res)}`);

    if (res.httpCode === 200) {
      clientStat.requestOk++;
    }
  } catch (e) {
    if (e.errorCode === TCustomErrorCode.TimeoutError) {
      clientStat.requestTimeout++;
    } else if (e.httpCode === 500) {
      console.log(`Server error for pingId(${pingId}) - ${JSON.stringify(e)}`);
      clientStat.request500++;
    }

    if (depth >= MAX_DEEP_RETRY) {
      throw e;
    }

    // exponential latency (ms)
    await wait(2 ** depth * 10);

    //trying to send data again
    return sendStatisticToServer(responseTime, pingId, depth + 1);
  }
};

/**
 * entry point to start client work
 */
setInterval(async () => {
  try {
    let responseTime = await getTargetPagePerformance();

    //if there is no information about the response from target server we skip iteration
    if (!responseTime) {
      return;
    }

    pingId++;

    await sendStatisticToServer(responseTime, pingId);
  } catch (e) {
    console.error(e);
  }
}, POLLING_DELAY);

// listen signal to stop events
exitHelper((signal: string) => {
  console.error(`The client is shutting down - ${signal}`);
  console.log("View the collected statistics:");
  console.log(`request all - ${clientStat.requestAll}`);
  console.log(`"Ok" count - ${clientStat.requestOk}`);
  console.log(`"500" count - ${clientStat.request500}`);
  console.log(`"timeout" count - ${clientStat.requestTimeout}`);

  process.exit(0);
});
