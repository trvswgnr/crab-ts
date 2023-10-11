export type Option<T> = T | null;
export type Result<T, E> = [T, null] | [null, E];

type AnyInstance = { new(...args: any[]): any };

export interface Clone<T> {
    clone(): T;
}

export interface Default {
    default<T extends abstract new (...args: any[]) => any>(): InstanceType<T>
    default(): unknown;
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
    count(): number;
    last(): Option<Item>;
    advanceBy(n: number): Result<void, number>;
    nth(n: number): Option<Item>;
    // stepBy(n: number): StepBy<this>;
    // chain<U extends Iterable<Item>>(other: U): Chain<this, U>;
    // zip<U extends Iterable<Item>>(other: U): Zip<this, U>;
    // intersperse(separator: Item): Intersperse<this>;
    // intersperseWith<G extends () => Item>(separator: G): IntersperseWith<this, G>;
    // map<B, F extends (a: Item) => B>(f: F): IMap<this, F>;
    forEach<F extends (a: Item) => void>(f: F): void;
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
export interface Rev<I> {
    rev(): Rev<I>;
}
export interface IntoIterator<Item> {
    intoIter(): Iterable<Item>;
}
export function staticImplements<A>(ctor: A): void;
export function staticImplements<A, B>(ctor: A & B): void;
export function staticImplements<A, B, C>(ctor: A & B & C): void;
export function staticImplements(ctor: any): void { }

export function methodStaticImplements<A>(method: A): TypedPropertyDescriptor<A>;
export function methodStaticImplements<A, B>(method: A & B): TypedPropertyDescriptor<A & B>;
export function methodStaticImplements<A, B, C>(method: A & B & C): TypedPropertyDescriptor<A & B & C>;
export function methodStaticImplements(method: any): TypedPropertyDescriptor<any> {
    return {
        value: method,
        writable: true,
        enumerable: false,
        configurable: true
    };
}

type Class = new (...args: any[]) => any;
export class Default {
    static default<T extends Class>(ctor: T): InstanceType<T> {
        if ('default' in ctor && typeof ctor.default === 'function') {
            return ctor.default();
        }
        try {
            return new ctor();
        } catch (e) {
            throw new Error(`Type ${ctor.name} does not implement static \`default\` method, and cannot be instantiated withpout arguments.`);
        }
    }
}
