class RcxException extends Error {

  constructor(public message: string, public statusCode?: number) {
    super(message);
    this.name = "RcxException";
    this.statusCode = statusCode;
    this.stack = (<any>new Error()).stack;
  }
}

export default RcxException;
