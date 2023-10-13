import { Default, Option, staticImplements } from "./traits/traits";

@staticImplements<Default>
export class Chain<Item, A extends Iterable<Item> = Iterable<Item>, B extends Iterable<Item> = Iterable<Item>> {
    constructor(public a: A, public b: B) {}

    static default<Item>() {
        return new Chain<Item>([], []);
    }

    *[Symbol.iterator]() {
        for (const item of this.a) {
            yield item;
        }
        for (const item of this.b) {
            yield item;
        }
        return null;
    }

    next(): Option<Item> {
        return this[Symbol.iterator]().next().value;
    }
}

function andThenOrClear<T, U>(opt: Option<T>, f: (x: T) => Option<U>): Option<U> {
    const x = f(opt!);
    if (x === null) {
        opt = null;
    }
    return x;
}
