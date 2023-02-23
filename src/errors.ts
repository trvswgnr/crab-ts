/**
 * Enum of JavaScript error types.
 */
export enum ErrorKind {
    Error = 'Error',
    AggregateError = 'AggregateError',
    EvalError = 'EvalError',
    RangeError = 'RangeError',
    ReferenceError = 'ReferenceError',
    SyntaxError = 'SyntaxError',
    TypeError = 'TypeError',
    URIError = 'URIError',
    InternalError = 'InternalError',

    UnimplementedError = 'UnimplementedError',
}

export class UnimplementedError extends Error {
    constructor(...params: any[]) {
        if (params[0] === undefined) {
            params[0] = 'not implemented';
        }
        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnimplementedError);
        }

        this.name = 'UnimplementedError';
    }
}
