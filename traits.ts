export type Option<T> = T | null;
export type Result<T, E> = [T, null] | [null, E];

export interface Clone<T> {
    clone(): T;
}
export interface Default<T> {
    default(): T;
}
export interface Debug {
    toString(): string;
}
export interface Display {
    toString(): string;
}
export interface BasicIterator<Item> extends Iterable<Item> {
    next(): Option<Item>;
    sizeHint(): [number, Option<number>];
    last(): Option<Item>;
}
export interface DoubleEndedIterator<Item> {
    nextBack(): Option<Item>;
    advanceBackBy(n: number): Result<void, number>;
    rfold<B>(init: B, f: (b: B, a: Item) => B): B;
    nthBack(n: number): Option<Item>;
    rfind<P extends (a: Item) => boolean>(predicate: P): Option<Item>;
}
export interface Extend<A> {
    extend<T extends Iterable<A>>(it: T): void;
    extendOne(a: A): void;
}
