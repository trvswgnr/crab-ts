import { Clone, Debug, Extend, Default, BasicIterator, DoubleEndedIterator, Result, Rev, Option, staticImplements } from "./traits";
import { deepClone } from "./deep-clone";
import { StdIterator } from "./iterator";


@staticImplements<Default>
export class LinkedList<T> implements Clone<LinkedList<T>>, Debug, Extend<T> {
    head: Option<Node<T>>;
    tail: Option<Node<T>>;
    length: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    static new<T>(): LinkedList<T> {
        return new LinkedList<T>();
    }

    append(other: LinkedList<T>): void {
        if (!this.tail) {
            this.head = other.head;
            this.tail = other.tail;
            this.length = other.length;

            other.clear();
        } else {
            if (other.head) {
                this.tail.next = other.head;
                other.head.prev = this.tail;
                this.tail = other.tail;
                this.length += other.length;

                other.clear();
            }
        }
    }

    iter(): Iter<T> {
        return new Iter(this);
    }

    cursorFront(): Cursor<T> {
        return new Cursor(0, null, this);
    }

    cursorBack(): Cursor<T> {
        return new Cursor(this.len() - 1, null, this);
    }

    isEmpty(): boolean {
        return this.head === null;
    }

    len(): number {
        return this.length;
    }

    clear(): void {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    contains(x: T): boolean {
        return this.iter().any((y) => x === y);
    }

    front(): Option<T> {
        return this.head?.element ?? null;
    }

    back(): Option<T> {
        return this.tail?.element ?? null;
    }

    pushFront(elt: T): void {
        let node = new Node(elt);
        pushFrontNode(this, node);
    }

    popFront(): Option<T> {
        return popFrontNode(this)?.map(Node.intoElement) ?? null;
    }

    pushBack(elt: T): void {
        let node = new Node(elt);
        pushBackNode(this, node);
    }

    popBack(): Option<T> {
        return popBackNode(this)?.map(Node.intoElement) ?? null;
    }

    splitOff(at: number): LinkedList<T> {
        let len = this.len();
        if (!(at <= len)) throw new Error("Cannot split off at a nonexistent index");

        if (at === 0) {
            return this;
        } else if (at === len) {
            return new LinkedList<T>();
        }

        let splitNode: Option<Node<T>> = null;
        if (at - 1 <= len - 1 - (at - 1)) {
            let iter = this.iter();
            for (let _ = 0; _ < at - 1; _++) {
                iter.next();
            }
            splitNode = iter.head
        } else {
            let iter = this.iter();
            for (let _ = 0; _ < len - 1 - (at - 1); _++) {
                iter.nextBack();
            }
            splitNode = iter.tail;
        }
        return splitOffAfterNode(this, splitNode, at);
    }

    remove(at: number): T {
        let len = this.len();
        throwIfNot(at < len, "Cannot remove at an index outside of the list bounds");

        let offsetFromEnd = len - at - 1;
        if (at <= offsetFromEnd) {
            let cursor = this.cursorFront();
            for (let _ = 0; _ < at; _++) {
                cursor.moveNext();
            }
            return cursor.removeCurrent()!;
        } else {
            let cursor = this.cursorBack();
            for (let _ = 0; _ < offsetFromEnd; _++) {
                cursor.movePrev();
            }
            return cursor.removeCurrent()!;
        }
    }

    extractIf<F extends (x: T) => boolean>(filter: F): ExtractIf<T, F> {
        let it = this.head;
        let oldLen = this.len();

        return new ExtractIf(this, it, filter, 0, oldLen);
    }

    /**
     * Implements the Clone trait.
     */
    clone(): LinkedList<T> {
        return deepClone(this);
    }

    /**
     * Implements the Debug trait.
     */
    toString(): string {
        let it = this.head;
        let s = "[";
        while (it !== null) {
            s += String(it.element);
            it = it.next;
            if (it !== null) {
                s += ", ";
            }
        }
        s += "]";
        return s;
    }

    /**
     * Implements the Extend trait.
     */
    extend<U extends Iterable<T>>(it: U) {
        for (const elt of it) {
            this.pushBack(elt);
        }
        return it;
    }

    extendOne(a: T): void {
        this.pushBack(a);
    }


    /**
     * Implements the Default trait.
     */
    static default<T>(): LinkedList<T> {
        return new LinkedList<T>();
    }
}

export class Node<T> {
    next: Option<Node<T>>;
    prev: Option<Node<T>>;
    element: T;

    constructor(element: T) {
        this.next = null;
        this.prev = null;
        this.element = element;
    }

    intoElement(): T {
        return this.element;
    }

    static intoElement<T>(node: Node<T>): T {
        return node.element;
    }

    map<U>(f: (x: Node<T>) => U): Option<U> {
        return f(this) ?? null;
    }
}

interface ListLike<T> {
    head: Option<Node<T>>;
    tail: Option<Node<T>>;
    length: number;
}


interface IterTraits<T> extends
    Clone<Iter<T>>,
    Debug,
    DoubleEndedIterator<T> { }


@staticImplements<Default>
export class Iter<T> extends StdIterator<T> implements IterTraits<T> {
    public head: Option<Node<T>>;
    public tail: Option<Node<T>>;
    public length: number;

    constructor(list: ListLike<T>) {
        super();
        this.head = list.head;
        this.tail = list.tail;
        this.length = list.length;
    }

    count(): number {
        return this.length;
    }

    advanceBy(n: number): Result<void, number> {
        for (let i = 0; i < n; i++) {
            if (this.next() === null) {
                return [null, n - i];
            }
        }
        return [void 0, null];
    }

    nth(n: number): Option<T> {
        let [_, err] = this.advanceBy(n);
        if (err !== null) {
            return null;
        }
        return this.next();
    }

    any(f: (x: T) => boolean): boolean {
        let head = this.head;
        while (head !== null) {
            if (f(head.element)) {
                return true;
            }
            head = head.next;
        }
        return false;
    }

    enumerate(): Enumerate<T, this> {
        return new Enumerate(this);
    }

    /*
     * Clone
     */

    clone(): Iter<T> {
        return deepClone(this);
    }

    /*
     * Debug
     */

    toString(): string {
        let it = this.head;
        let s = "[";
        while (it !== null) {
            s += String(it.element);
            it = it.next;
            if (it !== null) {
                s += ", ";
            }
        }
        s += "]";
        return s;
    }

    /*
     * BasicIterator
     */

    next(): Option<T> {
        if (this.length === 0) {
            return null;
        } else {
            return this.head?.map((node) => {
                this.length -= 1;
                this.head = node.next;
                return node.element;
            }) ?? null;
        }
    }

    sizeHint(): [number, Option<number>] {
        return [this.length, this.length!];
    }

    last(): Option<T> {
        return this.tail?.map(Node.intoElement) ?? null;
    }

    *[Symbol.iterator](): Generator<T> {
        let head = this.head;
        while (head !== null) {
            yield head.element;
            head = head.next;
        }
    }

    /*
     * DoubleEndedIterator
     */

    nextBack(): Option<T> {
        if (this.length === 0) {
            return null;
        } else {
            return this.tail?.map((node) => {
                this.length -= 1;
                this.tail = node.prev;
                return node.element;
            }) ?? null;
        }
    }

    advanceBackBy(n: number): Result<void, number> {
        for (let i = 0; i < n; i++) {
            if (this.nextBack() === null) {
                return [null, n - i];
            }
        }
        return [void 0, null];
    }

    nthBack(n: number): Option<T> {
        let [res, err] = this.advanceBackBy(n);
        if (err !== null) {
            return null;
        }
        return this.nextBack();
    }

    rfold<B>(init: B, f: (b: B, a: T) => B): B {
        let accum = init;
        let x: Option<T>;
        while (true) {
            x = this.nextBack();
            if (x === null) {
                break;
            }
            accum = f(accum, x);
        }
        return accum;
    }

    rfind<P extends (a: T) => boolean>(predicate: P): Option<T> {
        let x: Option<T>;
        while (true) {
            x = this.nextBack();
            if (x === null) {
                break;
            }
            if (predicate(x)) {
                return x;
            }
        }
        return null;
    }

    /*
     * Default
     */

    static default<T>(): Iter<T> {
        return new Iter(new LinkedList<T>());
    }
}

class Enumerate<Item, I extends Iter<Item>> {
    private iter: I;
    private count: number;
    constructor(iter: I) {
        this.iter = iter;
        this.count = 0;
    }

    *[Symbol.iterator](): Generator<[number, Item]> {
        let head = this.iter.head;
        while (head !== null) {
            yield [this.count, head.element];
            head = head.next;
            this.count += 1;
        }
    }
}


export class ExtractIf<
    T,
    F extends (x: T) => boolean,
> {
    list: LinkedList<T>;
    it: Option<Node<T>>;
    pred: F;
    idx: number;
    old_len: number;

    constructor(list: LinkedList<T>, it: Option<Node<T>>, pred: F, idx: number, old_len: number) {
        this.list = list;
        this.it = it;
        this.pred = pred;
        this.idx = idx;
        this.old_len = old_len;
    }
}

function throwIfNot(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}


export class Cursor<T> {
    constructor(
        private idx: number,
        private curr: Option<Node<T>>,
        private list: LinkedList<T>
    ) { }

    index(): Option<number> {
        return this.idx;
    }

    moveNext(): void {
        if (this.curr === null) {
            this.curr = this.list.head;
            this.idx = 0;
        } else {
            this.curr = this.curr?.next ?? null;
            this.idx += 1;
        }
    }

    movePrev(): void {
        if (this.curr === null) {
            this.curr = this.list.tail;
            this.idx = this.list.len() - 1;
        } else {
            this.curr = this.curr?.prev ?? null;
            this.idx -= 1;
        }
    }

    current(): Option<T> {
        return this.curr?.map((node) => node.element) ?? null;
    }

    peekNext(): Option<T> {
        let next: Option<Node<T>>;
        if (this.curr === null) {
            next = this.list.head;
        } else {
            next = this.curr.next;
        }
        return next?.map((node) => node.element) ?? null;
    }

    peekPrev(): Option<T> {
        let prev: Option<Node<T>>;
        if (this.curr === null) {
            prev = this.list.tail;
        } else {
            prev = this.curr.prev;
        }
        return prev?.map((node) => node.element) ?? null;
    }

    front(): Option<T> {
        return this.list.front();
    }

    back(): Option<T> {
        return this.list.back();
    }

    removeCurrent(): Option<T> {
        if (this.curr === null) {
            return null;
        }
        let unlinkedNode = this.curr;
        this.curr = unlinkedNode.next;
        unlinkNode(this.list, unlinkedNode);
        return unlinkedNode.element;
    }
}


/* private functions */

function pushFrontNode<T>(list: LinkedList<T>, node: Node<T>): void {
    node.next = list.head;
    node.prev = null;
    if (list.head === null) {
        list.tail = node;
    } else {
        list.head.prev = node;
    }
    list.head = node;
    list.length += 1;
}

function popFrontNode<T>(list: LinkedList<T>): Option<Node<T>> {
    if (list.head === null) {
        return null;
    }

    return list.head.map((node) => {
        list.head = node.next;
        if (list.head === null) {
            list.tail = null;
        } else {
            list.head.prev = null;
        }
        list.length -= 1;
        return node;
    });
}

function pushBackNode<T>(list: LinkedList<T>, node: Node<T>): void {
    node.next = null;
    node.prev = list.tail;
    if (list.tail === null) {
        list.head = node;
    } else {
        list.tail.next = node;
    }
    list.tail = node;
    list.length += 1;
}

function popBackNode<T>(list: LinkedList<T>): Option<Node<T>> {
    if (list.tail === null) {
        return null;
    }
    return list.tail.map((node) => {
        list.tail = node.prev;
        if (list.tail === null) {
            list.head = null;
        } else {
            list.tail.next = null;
        }
        list.length -= 1;
        return node;
    });
}

function splitOffAfterNode<T>(list: LinkedList<T>, splitNode: Option<Node<T>>, at: number): LinkedList<T> {
    if (splitNode) {
        let secondPartHead: Option<Node<T>>;
        let secondPartTail: Option<Node<T>>;
        secondPartHead = splitNode.next ?? null;

        if (secondPartHead) {
            secondPartHead.prev = null;
            secondPartTail = list.tail;
        } else {
            secondPartTail = null;
        }

        let secondPart = new LinkedList<T>();
        secondPart.head = secondPartHead;
        secondPart.tail = secondPartTail;
        secondPart.length = list.length - at;

        list.tail = splitNode;
        list.length = at;

        return secondPart;
    }

    return list;
}

function unlinkNode<T>(list: LinkedList<T>, node: Node<T>): void {
    if (node.prev) {
        node.prev.next = node.next;
    } else {
        list.head = node.next;
    }

    if (node.next) {
        node.next.prev = node.prev;
    } else {
        list.tail = node.prev;
    }

    list.length -= 1;
}
