import {Logger} from "@nestjs/common";
import {stringifyRequest} from "../utils";
const logger = new Logger("Middleware");
const api_source = "RCX-API";

export function logAllRequestResponse(request: any, response: any, next) {
  const {ip, method, originalUrl} = request;
  const userAgent = request.get("user-agent") || "";
  const stringifierRequest = stringifyRequest(request);
  let authToken = JSON.parse(stringifierRequest).authToken;
  authToken = authToken ? authToken : '';
  processLogs({data: "## Request start ## " + `${method} ${originalUrl} - ${userAgent} ${ip}`});
  processLogs({data: stringifierRequest});
  response.on("finish", () => {
    const {statusCode} = response;
    const contentLength = response.get("content-length");
    processLogs({data: "## Request End ## " + `${method} ${originalUrl} ${statusCode} ${contentLength} ${authToken} - ${userAgent} ${ip}`});
    processLogs({data: "## Request End ## " + `${method} ${originalUrl} ${statusCode} ${contentLength} ${authToken} - ${userAgent} ${ip}`})
  });
  next();
}

export function processLogs(data) {
  data['source'] = api_source;
  printLogConsole(data);
}

function printLogConsole(data) {
  logger.log(JSON.stringify(data));
}
