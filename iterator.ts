import { Default, Extend, Option, Result } from "./traits/traits.ts";
import { Chain } from "./chain.ts";

type AnyClass = abstract new (...args: any[]) => any;

export abstract class StdIterator<Item> implements Iterable<Item> {
    *[Symbol.iterator](): Iterator<Item> {
        while (true) {
            const next = this.next();
            if (next === null) {
                break;
            }
            yield next;
        }
    }

    advanceBy(n: number): Result<void, number> {
        for (let i = 0; i < n; i++) {
            if (this.next() === null) {
                return [null, n - i];
            }
        }
        return [void 0, null];
    }

    all<F extends (a: Item) => boolean>(f: F): boolean {
        return this.fold(true, (acc, item) => acc && f(item));
    }

    any<F extends (a: Item) => boolean>(f: F): boolean {
        return this.fold(false, (acc, item) => acc || f(item));
    }

    chain<U extends StdIterator<Item>>(other: U): Chain<Item, this, Iterable<Item>> {
        return new Chain(this, other.iter());
    }

    collect<B>(): B {
        throw new Error("Method `collect` is not implemented.");
    }

    collectInto<E>(collection: E): E {
        throw new Error("Method `collectInto` is not implemented.");
    }

    count(): number {
        return this.fold(0, (acc, _) => acc + 1);
    }

    enumerate(): Iterable<[number, Item]> {
        throw new Error("Method `enumerate` is not implemented.");
    }

    filter<P extends (a: Item) => boolean>(predicate: P): never {
        throw new Error("Method `filter` is not implemented.");
    }

    filterMap<B, F extends (a: Item) => Option<B>>(f: F): never {
        throw new Error("Method `filterMap` is not implemented.");
    }

    flatMap<B, F extends (a: Item) => Iterable<B>>(f: F): never {
        throw new Error("Method `flatMap` is not implemented.");
    }

    flatten(): never {
        throw new Error("Method `flatten` is not implemented.");
    }

    fold<B>(init: B, f: (b: B, a: Item) => B): B {
        let acc = init;
        for (const item of this) {
            acc = f(acc, item);
        }
        return acc;
    }

    forEach<F extends (a: Item) => void>(f: F): void {
        for (const item of this) {
            f(item);
        }
    }

    fuse(): never {
        throw new Error("Method `fuse` is not implemented.");
    }

    inspect<F extends (a: Item) => void>(f: F): never {
        throw new Error("Method `inspect` is not implemented.");
    }

    intersperse(separator: Item): never {
        throw new Error("Method `intersperse` is not implemented.");
    }

    intersperseWith<G extends () => Item>(separator: G): never {
        throw new Error("Method `intersperseWith` is not implemented.");
    }

    iter(): StdIterator<Item> {
        return this;
    }

    last(): Option<Item> {
        let last: Option<Item> = null;
        for (const item of this) {
            last = item;
        }
        return last;
    }

    map<B, F extends (a: Item) => B>(f: F): never {
        throw new Error("Method `map` is not implemented.");
    }

    mapWhile<B, F extends (a: Item) => Option<B>>(f: F): never {
        throw new Error("Method `mapWhile` is not implemented.");
    }

    mapWindows<F, R, const N extends number>(f: F): any {
        throw new Error("Method `mapWindows` is not implemented.");
    }

    next(): Option<Item> {
        throw new Error("Method `next` is not implemented.");
    }

    nth(n: number): Option<Item> {
        for (let i = 0; i < n; i++) {
            if (this.next() === null) {
                return null;
            }
        }
        return this.next();
    }

    peekable(): never {
        throw new Error("Method `peekable` is not implemented.");
    }

    partition<B extends AnyClass & Default, F extends (a: Item) => boolean>(f: F, BClass: InstanceType<B> extends Extend<Item> ? B : "Error: InstanceType<B> must implement the `Extend` trait"): [InstanceType<B> & Extend<Item>, InstanceType<B> & Extend<Item>] {
        if (typeof BClass === "string") {
            throw new Error(`Type ${BClass} does not implement \`Extend\` trait.`);
        }
        const left: InstanceType<B> & Extend<Item> = BClass.default<B>();
        const right: InstanceType<B> & Extend<Item> = BClass.default<B>();
        this.fold(void 0, extend(f, left, right));
        return [left, right];
    }

    scan<B, F extends (b: B, a: Item) => B>(init: B, f: F): never {
        throw new Error("Method `scan` is not implemented.");
    }

    skip(n: number): never {
        throw new Error("Method `skip` is not implemented.");
    }

    skipWhile<P extends (a: Item) => boolean>(predicate: P): never {
        throw new Error("Method `skipWhile` is not implemented.");
    }

    sizeHint(): [number, Option<number>] {
        return [0, null];
    }

    stepBy(n: number): never {
        throw new Error("Method `stepBy` is not implemented.");
    }

    take(n: number): never {
        throw new Error("Method `take` is not implemented.");
    }

    takeWhile<P extends (a: Item) => boolean>(predicate: P): never {
        throw new Error("Method `takeWhile` is not implemented.");
    }

    zip<U extends Iterable<Item>>(other: U): never {
        throw new Error("Method `zip` is not implemented.");
    }
}

function extend<T, B extends Extend<T>>(f: (x: T) => boolean, left: B, right: B): (x: void, y: T) => void {
    return (_, x) => {
        if (f(x)) {
            left.extendOne(x);
        } else {
            right.extendOne(x);
        }
    };
}

// class TestIter<Item> extends StdIterator<Item> {
//     index = 0;
//     length = 0;
//     constructor(public items: Item[]) {
//         super();
//         this.length = items.length;
//     }

//     next(): Option<Item> {
//         if (this.index < this.items.length) {
//             const item = this.items[this.index];
//             this.index += 1;
//             this.length -= 1;
//             return item;
//         }
//         return null;
//     }

//     sizeHint(): [number, Option<number>] {
//         return [this.length, this.length];
//     }
// }

// class Foo<T> {
//     items: T[];
//     constructor(...items: T[]) {
//         this.items = items;
//     }

//     iter() {
//         return new TestIter(this.items);
//     }

//     static default() {
//         return new Foo();
//     }

//     extend<T extends Iterable<any>>(it: T): void {
//         for (const item of it) {
//             this.items.push(item);
//         }
//     }

//     extendOne(a: T): void {
//         this.items.push(a);
//     }
// }

// const a = new Foo(1, 2, 3);
// let iter = a.iter();
// const p = iter.partition(x => x % 2 === 0, Foo);
// console.log(p);
