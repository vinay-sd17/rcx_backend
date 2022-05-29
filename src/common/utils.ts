import {Status} from "./status";
import {RcxResponse} from "./rcx.response";
import {getManager} from "typeorm";

export function mapToResponse(data: any, isError: boolean, status: Status) {
  let response = new RcxResponse();
  response.statusCode = isError ? Status.FAILURE : Status.SUCCESS;
  response.data = !isError ? data : null;
  response.status = Status[status];
  response.errors = isError ? data.message : null;

  if(isError) {
    delete response.data;
    let msg = [];
    msg.push(response.errors);
    response['message'] = msg;
    delete response.errors;
  }
  else
    delete response.errors;
  response.timestamp = new Date().toISOString();
  return response;
}

export function cleanUpSecurityContextAndUValueFromEntity(obj: any) {
  delete obj['securityContextService'];
  delete obj['c'];
}

export function stringifyRequest(request: any) {
  return JSON.stringify({
    headers: request.headers,
    authToken: request.headers.authorization,
    method: request.method,
    url: request.url,
    httpVersion: request.httpVersion,
    body: request.body,
    cookies: request.cookies,
    path: request.path,
    protocol: request.protocol,
    query: request.query,
    hostname: request.hostname,
    ip: request.ip,
    originalUrl: request.originalUrl,
    params: request.params,
  })
}

export function getDatabaseConnectionManager(name) {
  return getManager(name);
}
