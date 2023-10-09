export type Option<T> = T | null;

export class Cursor<T> {
    _index: number;
    _current: Option<Node<T>>;
    list: LinkedList<T>;

    constructor(index: number, current: Option<Node<T>>, list: LinkedList<T>) {
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
        let next: Option<Node<T>>;
        if (this._current === null) {
            next = this.list.head;
        } else {
            next = this._current.next;
        }
        return next?.map((node) => node.element) ?? null;
    }

    peekPrev(): Option<T> {
        let prev: Option<Node<T>>;
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

    map<U>(f: (x: Node<T>) => U): Option<U> {
        return f(this);
    }

    take(): Option<Node<T>> {
        return this;
    }

    [Symbol.dispose](): void {
        this.next = null;
        this.prev = null;
    }
}

export class LinkedList<T> {
    head: Option<Node<T>>;
    tail: Option<Node<T>>;
    _len: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this._len = 0;
    }

    append(other: this): void {
        if (!this.tail) {
            this.head = other.head;
            this.tail = other.tail;
            this._len = other._len;
            other._len = 0;
            other.head = null;
            other.tail = null;
        } else {
            if (other.head) {
                this.tail.next = other.head;
                other.head.prev = this.tail;
                this.tail = other.tail;
                this._len += other._len;

                other.head = null;
                other.tail = null;
                other._len = 0;
            }
        }
    }

    isEmpty(): boolean {
        return this.head === null;
    }

    len(): number {
        return this._len;
    }

    iter(): Iter<T> {
        return new Iter(this);
    }

    [Symbol.dispose](): void {
        let head = this.head;
        while (head !== null) {
            let next = head.next;
            head[Symbol.dispose]();
            head = next;
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

    private pushFrontNode(node: Node<T>): void {
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

    private pushBackNode(node: Node<T>): void {
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
        return this.popFrontNode()?.map((node) => node.element) ?? null;
    }

    private popFrontNode(): Option<Node<T>> {
        if (this.head === null) {
            return null;
        }
        return this.head.map((node) => {
            this.head = node.next;
            if (this.head === null) {
                this.tail = null;
            } else {
                this.head.prev = null;
            }
            this._len -= 1;
            return node;
        });
    }

    popBack(): Option<T> {
        return this.popBackNode()?.map((node) => node.element) ?? null;
    }

    private popBackNode(): Option<Node<T>> {
        if (this.tail === null) {
            return null;
        }
        return this.tail.map((node) => {
            this.tail = node.prev;
            if (this.tail === null) {
                this.head = null;
            } else {
                this.tail.next = null;
            }
            this._len -= 1;
            return node;
        });
    }

    splitOff(at: number): LinkedList<T> {
        let len = this.len();
        throwIfNot(at <= len, "Cannot split off at a nonexistent index");
        if (at === 0) {
            return this;
        } else if (at === len) {
            return new LinkedList();
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
        return this.splitOffAfterNode(splitNode, at);
    }

    private splitOffAfterNode(splitNode: Option<Node<T>>, at: number): LinkedList<T> {
        if (splitNode) {
            let secondPartHead: Option<Node<T>>;
            let secondPartTail: Option<Node<T>>;
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

        return this;
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

    cursorFront(): Cursor<T> {
        return new Cursor(0, null, this);
    }

    cursorBack(): Cursor<T> {
        return new Cursor(this.len() - 1, null, this);
    }

    extractIf<F extends (x: T) => boolean>(filter: F): ExtractIf<T, F> {
        let it = this.head;
        let oldLen = this.len();

        return new ExtractIf(this, it, filter, 0, oldLen);
    }

    unlinkNode(node: Node<T>): void {
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

export class Iter<T> {
    head: Option<Node<T>>;
    tail: Option<Node<T>>;
    _len: number;

    constructor(list: LinkedList<T>) {
        this.head = list.head;
        this.tail = list.tail;
        this._len = list._len;
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

    [Symbol.dispose](): void {
        this.head = null;
        this.tail = null;
    }

    *[Symbol.iterator](): Generator<T> {
        let head = this.head;
        while (head !== null) {
            yield head.element;
            head = head.next;
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