import {ArgumentsHost, Catch, ExceptionFilter, Logger} from "@nestjs/common";

@Catch()
export class GlobalExceptionHandler implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionHandler.name);

  catch(exception: any, host: ArgumentsHost): any {
    this.logger.error(JSON.stringify(exception));
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse<Response>();
    const request: any = ctx.getRequest<Request>();
    let responseStatusCode = null;
    let responseJson = null;
    if (exception.message === "Forbidden resource") {
      responseStatusCode = exception.status;
      responseJson = this.getResponseObj(responseStatusCode, "Access forbidden. Please provide valid API token");
    } else if (exception.message === "Http Exception") {
      responseStatusCode = 400;
      responseJson = this.getResponseObj(responseStatusCode, exception.response.errors);
    } else if (exception.message === "Bad Request Exception") {
      responseStatusCode = 400;
      responseJson = this.getResponseObj(responseStatusCode, exception.response.message);
    } else if (exception.statusCode === 401) {
      responseStatusCode = exception.statusCode;
      responseJson = this.getResponseObj(responseStatusCode, exception.message);
    } else if (exception.status === 400 || exception.status === 404) {
      responseStatusCode = exception.status;
      responseJson = this.getResponseObj(responseStatusCode, exception.message);
    } else {
      responseStatusCode = 500;
      responseJson = this.getResponseObj(responseStatusCode, "Oops! Something went wrong, please try again or contact ScSc team");
    }

    //setting all the response code as 200 for api
    //but in response data, status has the code
    //todo only for post getting 201 status on code. that to be changed
    response
        .status(200)
        .json(responseJson);
  }

  getResponseObj(statusCode, message) {
    let msg = [];
    if (Array.isArray(message))
      msg.push(...message);
    else
      msg.push(message);
    return {
      statusCode: statusCode,
      status: StatusCode[statusCode],
      message: msg,
      timestamp: new Date().toISOString()
    };
  }
}

enum StatusCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  INTERNAL_SERVER_ERROR = 500
}
