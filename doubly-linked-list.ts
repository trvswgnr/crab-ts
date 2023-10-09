type Option<T> = T | null;


import * as mem from './mem';


interface ILinkedList<T> {
    head: Option<INode<T>>;
    tail: Option<INode<T>>;
    _len: number;
    [Symbol.dispose](): void;
    append(other: LinkedList<T>): void;
    clear(): void;
    contains(x: T): boolean;
    isEmpty(): boolean;
    len(): number;
    iter(): IIter<T>;
    front(): Option<T>;
    back(): Option<T>;
    pushFront(x: T): void;
    pushBack(x: T): void;
    popFront(): Option<T>;
    popBack(): Option<T>;
    splitOff(at: number): LinkedList<T>;
    remove(at: number): T;
    extractIf<F extends (x: T) => boolean>(f: F): LinkedList<T>;

    cursorFront(): ICursor<T>;
    cursorBack(): ICursor<T>;

    unlinkNode(node: INode<T>): void;
}

interface INode<T> {
    next: Option<INode<T>>;
    prev: Option<INode<T>>;
    element: T;
    map<U>(f: (x: INode<T>) => U): Option<U>;
    intoElement(): T;
    take(): Option<INode<T>>;
    [Symbol.dispose](): void;
}

interface IIter<T> {
    head: Option<INode<T>>;
    tail: Option<INode<T>>;
    _len: number;

    any(f: (x: T) => boolean): boolean;
    next(): Option<T>;
    nextBack(): Option<T>;
}

interface ICursor<T> {
    _index: number;
    _current: Option<INode<T>>;
    list: ILinkedList<T>;
    index(): Option<number>;
    moveNext(): void;
    movePrev(): void;
    current(): Option<T>;
    peekNext(): Option<T>;
    peekPrev(): Option<T>;
    front(): Option<T>;
    back(): Option<T>;
    removeCurrent(): Option<T>;
}

class Cursor<T> implements ICursor<T> {
    _index: number;
    _current: Option<INode<T>>;
    list: ILinkedList<T>;

    constructor(index: number, current: Option<INode<T>>, list: ILinkedList<T>) {
        this._index = index;
        this._current = current;
        this.list = list;
    }

    index(): Option<number> {
        return this._index;
    }

    moveNext(): void {
        if (this._current?.take() === null) {
            this._current = this.list.head;
            this._index = 0;
        } else {
            this._current = this._current?.next ?? null;
            this._index += 1;
        }
    }

    movePrev(): void {
        if (this._current?.take() === null) {
            this._current = this.list.tail;
            this._index = this.list.len() - 1;
        } else {
            this._current = this._current?.prev ?? null;
            this._index -= 1;
        }
    }

    current(): Option<T> {
        return this._current?.map((node) => node.element) ?? null;
    }

    peekNext(): Option<T> {
        let next: Option<INode<T>>;
        if (this._current === null) {
            next = this.list.head;
        } else {
            next = this._current.next;
        }
        return next?.map((node) => node.element) ?? null;
    }

    peekPrev(): Option<T> {
        let prev: Option<INode<T>>;
        if (this._current === null) {
            prev = this.list.tail;
        } else {
            prev = this._current.prev;
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
        let unlinkedNode = this._current!;
        this._current = unlinkedNode.next;
        this.list.unlinkNode(unlinkedNode);
        return unlinkedNode.element;
    }
}

interface IIntoIter<T> {
    list: ILinkedList<T>;
}

class Node<T> implements INode<T> {
    next: Option<INode<T>>;
    prev: Option<INode<T>>;
    element: T;

    constructor(element: T) {
        this.next = null;
        this.prev = null;
        this.element = element;
    }

    intoElement(): T {
        return this.element;
    }

    map<U>(f: (x: INode<T>) => U): Option<U> {
        return f(this);
    }

    take(): Option<INode<T>> {
        return mem.replace(this, null);
    }

    [Symbol.dispose](): void {
        this.next = null;
        this.prev = null;
    }
}

class LinkedList<T> implements ILinkedList<T> {
    head: Option<INode<T>>;
    tail: Option<INode<T>>;
    _len: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this._len = 0;
    }

    append(other: LinkedList<T>): void {
        if (!this.tail) {
            mem.swap(this, other);
        } else {
            if (other.head !== null) {
                this.tail.next = other.head;
                other.head.prev = this.tail;
            }

            this.tail = other.tail;
            this._len += mem.replace(other._len, 0);
        }
    }

    isEmpty(): boolean {
        return this.head === null;
    }

    len(): number {
        return this._len;
    }

    iter(): IIter<T> {
        return new Iter(this);
    }

    [Symbol.dispose](): void {
        let mut_head = mem.replace(this.head, null);
        while (mut_head !== null) {
            let next = mem.replace(mut_head.next, null);
            mem.drop(mut_head);
            mut_head = next;
        }
    }

    clear(): void {
        this[Symbol.dispose]();
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
        this.pushFrontNode(node);
    }

    private pushFrontNode(node: INode<T>): void {
        node.next = this.head;
        node.prev = null;
        if (this.head === null) {
            this.tail = node;
        } else {
            this.head.prev = node;
        }
        this.head = node;
        this._len += 1;
    }

    pushBack(elt: T): void {
        let node = new Node(elt);
        this.pushBackNode(node);
    }

    private pushBackNode(node: INode<T>): void {
        node.next = null;
        node.prev = this.tail;
        if (this.tail === null) {
            this.head = node;
        } else {
            this.tail.next = node;
        }
        this.tail = node;
        this._len += 1;
    }

    popFront(): Option<T> {
        return this.popFrontNode()?.map((node) => node.intoElement()) ?? null;
    }

    private popFrontNode(): Option<INode<T>> {
        if (this.head === null) {
            return null;
        }
        this.head.map((node) => {
            this.head = node.next;
            if (this.head === null) {
                this.tail = null;
            } else {
                this.head.prev = null;
            }
            this._len -= 1;
            return node;
        });

        return this.head;
    }

    popBack(): Option<T> {
        return this.popBackNode()?.map((node) => node.intoElement()) ?? null;
    }

    private popBackNode(): Option<INode<T>> {
        if (this.tail === null) {
            return null;
        }
        this.tail.map((node) => {
            this.tail = node.prev;
            if (this.tail === null) {
                this.head = null;
            } else {
                this.tail.next = null;
            }
            this._len -= 1;
            return node;
        });

        return this.tail;
    }

    splitOff(at: number): LinkedList<T> {
        let len = this.len();
        _assert(at <= len, "Cannot split off at a nonexistent index");
        if (at === 0) {
            return mem.replace(this, new LinkedList());
        } else if (at === len) {
            return new LinkedList();
        }

        let splitNode: Option<INode<T>> = null;
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
        return this.splitOffAfterNode(splitNode, at);
    }

    private splitOffAfterNode(splitNode: Option<INode<T>>, at: number): LinkedList<T> {
        if (splitNode) {
            let secondPartHead: Option<INode<T>>;
            let secondPartTail: Option<INode<T>>;
            secondPartHead = splitNode.next?.take() ?? null;

            if (secondPartHead) {
                secondPartHead.prev = null;
                secondPartTail = this.tail;
            } else {
                secondPartTail = null;
            }

            let secondPart = new LinkedList<T>();
            secondPart.head = secondPartHead;
            secondPart.tail = secondPartTail;
            secondPart._len = this._len - at;

            this.tail = splitNode;
            this._len = at;

            return secondPart;
        }

        return mem.replace(this, new LinkedList());
    }

    remove(at: number): T {
        let len = this.len();
        _assert(at < len, "Cannot remove at an index outside of the list bounds");

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

    cursorFront(): ICursor<T> {
        return new Cursor(0, null, this);
    }

    cursorBack(): ICursor<T> {
        return new Cursor(this.len() - 1, null, this);
    }

    extractIf<F extends (x: T) => boolean>(filter: F): ExtractIf<T, F> {
       let it = this.head;
       let oldLen = this.len();

       return new ExtractIf(this, it, filter, 0, oldLen);
    }

    unlinkNode(node: INode<T>): void {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }

        this._len -= 1;
    }
}

class Iter<T> implements IIter<T> {
    head: Option<INode<T>>;
    tail: Option<INode<T>>;
    _len: number;

    constructor(list: LinkedList<T>) {
        this.head = list.head;
        this.tail = list.tail;
        this._len = list._len;
    }

    any(f: (x: T) => boolean): boolean {
        let mut_head = this.head;
        while (mut_head !== null) {
            if (f(mut_head.element)) {
                return true;
            }
            mut_head = mut_head.next;
        }
        return false;
    }

    next(): Option<T> {
        return this.head?.map((node) => {
            this.head = node.next;
            return node.intoElement();
        }) ?? null;
    }

    nextBack(): Option<T> {
        return this.tail?.map((node) => {
            this.tail = node.prev;
            return node.intoElement();
        }) ?? null;
    }
}


function _assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}


class ExtractIf<
    T,
    F extends (x:T) => boolean,
> {
    list: ILinkedList<T>;
    it: Option<INode<T>>;
    pred: F;
    idx: number;
    old_len: number;

    constructor(list: ILinkedList<T>, it: Option<INode<T>>, pred: F, idx: number, old_len: number) {
        this.list = list;
        this.it = it;
        this.pred = pred;
        this.idx = idx;
        this.old_len = old_len;
    }
}