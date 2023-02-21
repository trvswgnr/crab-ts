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
