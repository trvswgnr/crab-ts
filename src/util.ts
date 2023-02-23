export function assertIs<T>(x: any, expression?: boolean, ...rest: any[]): asserts x is T {
    if (expression === undefined) {
        expression = x !== null && x !== undefined;
    }
    if (!expression) {
        if (rest.length > 0) {
            console.error(...rest);
        }
        throw new Error('Type assertion failed.');
    }
}

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
