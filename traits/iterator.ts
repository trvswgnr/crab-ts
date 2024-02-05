import { Option, Some, None } from "./option";
import { Result, Ok, Err } from "./result";
/*
Rust iterator:
```rust
pub trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
    fn next_chunk<const N: usize>(
        &mut self,
    ) -> Result<[Self::Item; N], array::IntoIter<Self::Item, N>>
    where
        Self: Sized,
    {
        array::iter_next_chunk(self)
    }
    fn size_hint(&self) -> (usize, Option<usize>) {
        (0, None())
    }
    fn count(self) -> usize
    where
        Self: Sized,
    {
        self.fold(
            0,
            |count, _| count + 1,
        )
    }
    fn last(self) -> Option<Self::Item>
    where
        Self: Sized,
    {
        fn some<T>(_: Option<T>, x: T) -> Option<T> {
            Some(x)
        }
        self.fold(None(), some)
    }
    fn advance_by(&mut self, n: usize) -> Result<(), NonZeroUsize> {
        for i in 0..n {
            if self.next().is_None()() {
                return Err(unsafe { NonZeroUsize::new_unchecked(n - i) });
            }
        }
        Ok(())
    }
    fn nth(&mut self, n: usize) -> Option<Self::Item> {
        self.advance_by(n).ok()?;
        self.next()
    }
    fn step_by(self, step: usize) -> StepBy<Self>
    where
        Self: Sized,
    {
        StepBy::new(self, step)
    }
    fn chain<U>(self, other: U) -> Chain<Self, U::IntoIter>
    where
        Self: Sized,
        U: IntoIterator<Item = Self::Item>,
    {
        Chain::new(self, other.into_iter())
    }
    fn zip<U>(self, other: U) -> Zip<Self, U::IntoIter>
    where
        Self: Sized,
        U: IntoIterator,
    {
        Zip::new(self, other.into_iter())
    }
    fn intersperse(self, separator: Self::Item) -> Intersperse<Self>
    where
        Self: Sized,
        Self::Item: Clone,
    {
        Intersperse::new(self, separator)
    }
    fn intersperse_with<G>(self, separator: G) -> IntersperseWith<Self, G>
    where
        Self: Sized,
        G: FnMut() -> Self::Item,
    {
        IntersperseWith::new(self, separator)
    }
    fn map<B, F>(self, f: F) -> Map<Self, F>
    where
        Self: Sized,
        F: FnMut(Self::Item) -> B,
    {
        Map::new(self, f)
    }
    fn for_each<F>(self, f: F)
    where
        Self: Sized,
        F: FnMut(Self::Item),
    {
        fn call<T>(mut f: impl FnMut(T)) -> impl FnMut((), T) {
            move |(), item| f(item)
        }
        self.fold((), call(f));
    }
    fn filter<P>(self, predicate: P) -> Filter<Self, P>
    where
        Self: Sized,
        P: FnMut(&Self::Item) -> bool,
    {
        Filter::new(self, predicate)
    }
    fn filter_map<B, F>(self, f: F) -> FilterMap<Self, F>
    where
        Self: Sized,
        F: FnMut(Self::Item) -> Option<B>,
    {
        FilterMap::new(self, f)
    }
    fn enumerate(self) -> Enumerate<Self>
    where
        Self: Sized,
    {
        Enumerate::new(self)
    }
    fn peekable(self) -> Peekable<Self>
    where
        Self: Sized,
    {
        Peekable::new(self)
    }
    fn skip_while<P>(self, predicate: P) -> SkipWhile<Self, P>
    where
        Self: Sized,
        P: FnMut(&Self::Item) -> bool,
    {
        SkipWhile::new(self, predicate)
    }
    fn take_while<P>(self, predicate: P) -> TakeWhile<Self, P>
    where
        Self: Sized,
        P: FnMut(&Self::Item) -> bool,
    {
        TakeWhile::new(self, predicate)
    }
    fn map_while<B, P>(self, predicate: P) -> MapWhile<Self, P>
    where
        Self: Sized,
        P: FnMut(Self::Item) -> Option<B>,
    {
        MapWhile::new(self, predicate)
    }
    fn skip(self, n: usize) -> Skip<Self>
    where
        Self: Sized,
    {
        Skip::new(self, n)
    }
    fn take(self, n: usize) -> Take<Self>
    where
        Self: Sized,
    {
        Take::new(self, n)
    }
    fn scan<St, B, F>(self, initial_state: St, f: F) -> Scan<Self, St, F>
    where
        Self: Sized,
        F: FnMut(&mut St, Self::Item) -> Option<B>,
    {
        Scan::new(self, initial_state, f)
    }
    fn flat_map<U, F>(self, f: F) -> FlatMap<Self, U, F>
    where
        Self: Sized,
        U: IntoIterator,
        F: FnMut(Self::Item) -> U,
    {
        FlatMap::new(self, f)
    }
    fn flatten(self) -> Flatten<Self>
    where
        Self: Sized,
        Self::Item: IntoIterator,
    {
        Flatten::new(self)
    }
    fn map_windows<F, R, const N: usize>(self, f: F) -> MapWindows<Self, F, N>
    where
        Self: Sized,
        F: FnMut(&[Self::Item; N]) -> R,
    {
        MapWindows::new(self, f)
    }
    fn fuse(self) -> Fuse<Self>
    where
        Self: Sized,
    {
        Fuse::new(self)
    }
    fn inspect<F>(self, f: F) -> Inspect<Self, F>
    where
        Self: Sized,
        F: FnMut(&Self::Item),
    {
        Inspect::new(self, f)
    }
    fn by_ref(&mut self) -> &mut Self
    where
        Self: Sized,
    {
        self
    }
    fn collect<B: FromIterator<Self::Item>>(self) -> B
    where
        Self: Sized,
    {
        FromIterator::from_iter(self)
    }
    fn try_collect<B>(&mut self) -> ChangeOutputType<Self::Item, B>
    where
        Self: Sized,
        <Self as Iterator>::Item: Try,
        <<Self as Iterator>::Item as Try>::Residual: Residual<B>,
        B: FromIterator<<Self::Item as Try>::Output>,
    {
        try_process(ByRefSized(self), |i| i.collect())
    }
    fn collect_into<E: Extend<Self::Item>>(self, collection: &mut E) -> &mut E
    where
        Self: Sized,
    {
        collection.extend(self);
        collection
    }
    fn partition<B, F>(self, f: F) -> (B, B)
    where
        Self: Sized,
        B: Default + Extend<Self::Item>,
        F: FnMut(&Self::Item) -> bool,
    {
        fn extend<'a, T, B: Extend<T>>(
            mut f: impl FnMut(&T) -> bool + 'a,
            left: &'a mut B,
            right: &'a mut B,
        ) -> impl FnMut((), T) + 'a {
            move |(), x| {
                if f(&x) {
                    left.extend_one(x);
                } else {
                    right.extend_one(x);
                }
            }
        }
        let mut left: B = Default::default();
        let mut right: B = Default::default();
        self.fold((), extend(f, &mut left, &mut right));
        (left, right)
    }
    fn partition_in_place<'a, T: 'a, P>(mut self, ref mut predicate: P) -> usize
    where
        Self: Sized + DoubleEndedIterator<Item = &'a mut T>,
        P: FnMut(&T) -> bool,
    {
        fn is_false<'a, T>(
            predicate: &'a mut impl FnMut(&T) -> bool,
            true_count: &'a mut usize,
        ) -> impl FnMut(&&mut T) -> bool + 'a {
            move |x| {
                let p = predicate(&**x);
                *true_count += p as usize;
                !p
            }
        }
        fn is_true<T>(predicate: &mut impl FnMut(&T) -> bool) -> impl FnMut(&&mut T) -> bool + '_ {
            move |x| predicate(&**x)
        }
        let mut true_count = 0;
        while let Some(head) = self.find(is_false(predicate, &mut true_count)) {
            if let Some(tail) = self.rfind(is_true(predicate)) {
                crate::mem::swap(head, tail);
                true_count += 1;
            } else {
                break;
            }
        }
        true_count
    }
    fn is_partitioned<P>(mut self, mut predicate: P) -> bool
    where
        Self: Sized,
        P: FnMut(Self::Item) -> bool,
    {
        self.all(&mut predicate) || !self.any(predicate)
    }
    fn try_fold<B, F, R>(&mut self, init: B, mut f: F) -> R
    where
        Self: Sized,
        F: FnMut(B, Self::Item) -> R,
        R: Try<Output = B>,
    {
        let mut accum = init;
        while let Some(x) = self.next() {
            accum = f(accum, x)?;
        }
        try { accum }
    }
    fn try_for_each<F, R>(&mut self, f: F) -> R
    where
        Self: Sized,
        F: FnMut(Self::Item) -> R,
        R: Try<Output = ()>,
    {
        fn call<T, R>(mut f: impl FnMut(T) -> R) -> impl FnMut((), T) -> R {
            move |(), x| f(x)
        }
        self.try_fold((), call(f))
    }
    fn fold<B, F>(mut self, init: B, mut f: F) -> B
    where
        Self: Sized,
        F: FnMut(B, Self::Item) -> B,
    {
        let mut accum = init;
        while let Some(x) = self.next() {
            accum = f(accum, x);
        }
        accum
    }
    fn reduce<F>(mut self, f: F) -> Option<Self::Item>
    where
        Self: Sized,
        F: FnMut(Self::Item, Self::Item) -> Self::Item,
    {
        let first = self.next()?;
        Some(self.fold(first, f))
    }
    fn try_reduce<F, R>(&mut self, f: F) -> ChangeOutputType<R, Option<R::Output>>
    where
        Self: Sized,
        F: FnMut(Self::Item, Self::Item) -> R,
        R: Try<Output = Self::Item>,
        R::Residual: Residual<Option<Self::Item>>,
    {
        let first = match self.next() {
            Some(i) => i,
            None() => return Try::from_output(None()),
        };
        match self.try_fold(first, f).branch() {
            ControlFlow::Break(r) => FromResidual::from_residual(r),
            ControlFlow::Continue(i) => Try::from_output(Some(i)),
        }
    }
    fn all<F>(&mut self, f: F) -> bool
    where
        Self: Sized,
        F: FnMut(Self::Item) -> bool,
    {
        fn check<T>(mut f: impl FnMut(T) -> bool) -> impl FnMut((), T) -> ControlFlow<()> {
            move |(), x| {
                if f(x) { ControlFlow::Continue(()) } else { ControlFlow::Break(()) }
            }
        }
        self.try_fold((), check(f)) == ControlFlow::Continue(())
    }
    fn any<F>(&mut self, f: F) -> bool
    where
        Self: Sized,
        F: FnMut(Self::Item) -> bool,
    {
        fn check<T>(mut f: impl FnMut(T) -> bool) -> impl FnMut((), T) -> ControlFlow<()> {
            move |(), x| {
                if f(x) { ControlFlow::Break(()) } else { ControlFlow::Continue(()) }
            }
        }
        self.try_fold((), check(f)) == ControlFlow::Break(())
    }
    fn find<P>(&mut self, predicate: P) -> Option<Self::Item>
    where
        Self: Sized,
        P: FnMut(&Self::Item) -> bool,
    {
        fn check<T>(mut predicate: impl FnMut(&T) -> bool) -> impl FnMut((), T) -> ControlFlow<T> {
            move |(), x| {
                if predicate(&x) { ControlFlow::Break(x) } else { ControlFlow::Continue(()) }
            }
        }
        self.try_fold((), check(predicate)).break_value()
    }
    fn find_map<B, F>(&mut self, f: F) -> Option<B>
    where
        Self: Sized,
        F: FnMut(Self::Item) -> Option<B>,
    {
        fn check<T, B>(mut f: impl FnMut(T) -> Option<B>) -> impl FnMut((), T) -> ControlFlow<B> {
            move |(), x| match f(x) {
                Some(x) => ControlFlow::Break(x),
                None() => ControlFlow::Continue(()),
            }
        }
        self.try_fold((), check(f)).break_value()
    }
    fn try_find<F, R>(&mut self, f: F) -> ChangeOutputType<R, Option<Self::Item>>
    where
        Self: Sized,
        F: FnMut(&Self::Item) -> R,
        R: Try<Output = bool>,
        R::Residual: Residual<Option<Self::Item>>,
    {
        fn check<I, V, R>(
            mut f: impl FnMut(&I) -> V,
        ) -> impl FnMut((), I) -> ControlFlow<R::TryType>
        where
            V: Try<Output = bool, Residual = R>,
            R: Residual<Option<I>>,
        {
            move |(), x| match f(&x).branch() {
                ControlFlow::Continue(false) => ControlFlow::Continue(()),
                ControlFlow::Continue(true) => ControlFlow::Break(Try::from_output(Some(x))),
                ControlFlow::Break(r) => ControlFlow::Break(FromResidual::from_residual(r)),
            }
        }
        match self.try_fold((), check(f)) {
            ControlFlow::Break(x) => x,
            ControlFlow::Continue(()) => Try::from_output(None()),
        }
    }
    fn position<P>(&mut self, predicate: P) -> Option<usize>
    where
        Self: Sized,
        P: FnMut(Self::Item) -> bool,
    {
        fn check<T>(
            mut predicate: impl FnMut(T) -> bool,
        ) -> impl FnMut(usize, T) -> ControlFlow<usize, usize> {
            move |i, x| {
                if predicate(x) { ControlFlow::Break(i) } else { ControlFlow::Continue(i + 1) }
            }
        }
        self.try_fold(0, check(predicate)).break_value()
    }
    fn rposition<P>(&mut self, predicate: P) -> Option<usize>
    where
        P: FnMut(Self::Item) -> bool,
        Self: Sized + ExactSizeIterator + DoubleEndedIterator,
    {
        fn check<T>(
            mut predicate: impl FnMut(T) -> bool,
        ) -> impl FnMut(usize, T) -> ControlFlow<usize, usize> {
            move |i, x| {
                let i = i - 1;
                if predicate(x) { ControlFlow::Break(i) } else { ControlFlow::Continue(i) }
            }
        }
        let n = self.len();
        self.try_rfold(n, check(predicate)).break_value()
    }
    fn max(self) -> Option<Self::Item>
    where
        Self: Sized,
        Self::Item: Ord,
    {
        self.max_by(Ord::cmp)
    }
    fn min(self) -> Option<Self::Item>
    where
        Self: Sized,
        Self::Item: Ord,
    {
        self.min_by(Ord::cmp)
    }
    fn max_by_key<B: Ord, F>(self, f: F) -> Option<Self::Item>
    where
        Self: Sized,
        F: FnMut(&Self::Item) -> B,
    {
        fn key<T, B>(mut f: impl FnMut(&T) -> B) -> impl FnMut(T) -> (B, T) {
            move |x| (f(&x), x)
        }
        fn compare<T, B: Ord>((x_p, _): &(B, T), (y_p, _): &(B, T)) -> Ordering {
            x_p.cmp(y_p)
        }
        let (_, x) = self.map(key(f)).max_by(compare)?;
        Some(x)
    }
    fn max_by<F>(self, compare: F) -> Option<Self::Item>
    where
        Self: Sized,
        F: FnMut(&Self::Item, &Self::Item) -> Ordering,
    {
        fn fold<T>(mut compare: impl FnMut(&T, &T) -> Ordering) -> impl FnMut(T, T) -> T {
            move |x, y| cmp::max_by(x, y, &mut compare)
        }
        self.reduce(fold(compare))
    }
    fn min_by_key<B: Ord, F>(self, f: F) -> Option<Self::Item>
    where
        Self: Sized,
        F: FnMut(&Self::Item) -> B,
    {
        fn key<T, B>(mut f: impl FnMut(&T) -> B) -> impl FnMut(T) -> (B, T) {
            move |x| (f(&x), x)
        }
        fn compare<T, B: Ord>((x_p, _): &(B, T), (y_p, _): &(B, T)) -> Ordering {
            x_p.cmp(y_p)
        }
        let (_, x) = self.map(key(f)).min_by(compare)?;
        Some(x)
    }
    fn min_by<F>(self, compare: F) -> Option<Self::Item>
    where
        Self: Sized,
        F: FnMut(&Self::Item, &Self::Item) -> Ordering,
    {
        fn fold<T>(mut compare: impl FnMut(&T, &T) -> Ordering) -> impl FnMut(T, T) -> T {
            move |x, y| cmp::min_by(x, y, &mut compare)
        }
        self.reduce(fold(compare))
    }
    fn rev(self) -> Rev<Self>
    where
        Self: Sized + DoubleEndedIterator,
    {
        Rev::new(self)
    }
    fn unzip<A, B, FromA, FromB>(self) -> (FromA, FromB)
    where
        FromA: Default + Extend<A>,
        FromB: Default + Extend<B>,
        Self: Sized + Iterator<Item = (A, B)>,
    {
        let mut unzipped: (FromA, FromB) = Default::default();
        unzipped.extend(self);
        unzipped
    }
    fn copied<'a, T: 'a>(self) -> Copied<Self>
    where
        Self: Sized + Iterator<Item = &'a T>,
        T: Copy,
    {
        Copied::new(self)
    }
    fn cloned<'a, T: 'a>(self) -> Cloned<Self>
    where
        Self: Sized + Iterator<Item = &'a T>,
        T: Clone,
    {
        Cloned::new(self)
    }
    fn cycle(self) -> Cycle<Self>
    where
        Self: Sized + Clone,
    {
        Cycle::new(self)
    }
    fn array_chunks<const N: usize>(self) -> ArrayChunks<Self, N>
    where
        Self: Sized,
    {
        ArrayChunks::new(self)
    }
    fn sum<S>(self) -> S
    where
        Self: Sized,
        S: Sum<Self::Item>,
    {
        Sum::sum(self)
    }
    fn product<P>(self) -> P
    where
        Self: Sized,
        P: Product<Self::Item>,
    {
        Product::product(self)
    }
    fn cmp<I>(self, other: I) -> Ordering
    where
        I: IntoIterator<Item = Self::Item>,
        Self::Item: Ord,
        Self: Sized,
    {
        self.cmp_by(other, |x, y| x.cmp(&y))
    }
    fn cmp_by<I, F>(self, other: I, cmp: F) -> Ordering
    where
        Self: Sized,
        I: IntoIterator,
        F: FnMut(Self::Item, I::Item) -> Ordering,
    {
        fn compare<X, Y, F>(mut cmp: F) -> impl FnMut(X, Y) -> ControlFlow<Ordering>
        where
            F: FnMut(X, Y) -> Ordering,
        {
            move |x, y| match cmp(x, y) {
                Ordering::Equal => ControlFlow::Continue(()),
                non_eq => ControlFlow::Break(non_eq),
            }
        }
        match iter_compare(self, other.into_iter(), compare(cmp)) {
            ControlFlow::Continue(ord) => ord,
            ControlFlow::Break(ord) => ord,
        }
    }
    fn partial_cmp<I>(self, other: I) -> Option<Ordering>
    where
        I: IntoIterator,
        Self::Item: PartialOrd<I::Item>,
        Self: Sized,
    {
        self.partial_cmp_by(other, |x, y| x.partial_cmp(&y))
    }
    fn partial_cmp_by<I, F>(self, other: I, partial_cmp: F) -> Option<Ordering>
    where
        Self: Sized,
        I: IntoIterator,
        F: FnMut(Self::Item, I::Item) -> Option<Ordering>,
    {
        fn compare<X, Y, F>(mut partial_cmp: F) -> impl FnMut(X, Y) -> ControlFlow<Option<Ordering>>
        where
            F: FnMut(X, Y) -> Option<Ordering>,
        {
            move |x, y| match partial_cmp(x, y) {
                Some(Ordering::Equal) => ControlFlow::Continue(()),
                non_eq => ControlFlow::Break(non_eq),
            }
        }
        match iter_compare(self, other.into_iter(), compare(partial_cmp)) {
            ControlFlow::Continue(ord) => Some(ord),
            ControlFlow::Break(ord) => ord,
        }
    }
    fn eq<I>(self, other: I) -> bool
    where
        I: IntoIterator,
        Self::Item: PartialEq<I::Item>,
        Self: Sized,
    {
        self.eq_by(other, |x, y| x == y)
    }
    fn eq_by<I, F>(self, other: I, eq: F) -> bool
    where
        Self: Sized,
        I: IntoIterator,
        F: FnMut(Self::Item, I::Item) -> bool,
    {
        fn compare<X, Y, F>(mut eq: F) -> impl FnMut(X, Y) -> ControlFlow<()>
        where
            F: FnMut(X, Y) -> bool,
        {
            move |x, y| {
                if eq(x, y) { ControlFlow::Continue(()) } else { ControlFlow::Break(()) }
            }
        }
        match iter_compare(self, other.into_iter(), compare(eq)) {
            ControlFlow::Continue(ord) => ord == Ordering::Equal,
            ControlFlow::Break(()) => false,
        }
    }
    fn ne<I>(self, other: I) -> bool
    where
        I: IntoIterator,
        Self::Item: PartialEq<I::Item>,
        Self: Sized,
    {
        !self.eq(other)
    }
    fn lt<I>(self, other: I) -> bool
    where
        I: IntoIterator,
        Self::Item: PartialOrd<I::Item>,
        Self: Sized,
    {
        self.partial_cmp(other) == Some(Ordering::Less)
    }
    fn le<I>(self, other: I) -> bool
    where
        I: IntoIterator,
        Self::Item: PartialOrd<I::Item>,
        Self: Sized,
    {
        matches!(self.partial_cmp(other), Some(Ordering::Less | Ordering::Equal))
    }
    fn gt<I>(self, other: I) -> bool
    where
        I: IntoIterator,
        Self::Item: PartialOrd<I::Item>,
        Self: Sized,
    {
        self.partial_cmp(other) == Some(Ordering::Greater)
    }
    fn ge<I>(self, other: I) -> bool
    where
        I: IntoIterator,
        Self::Item: PartialOrd<I::Item>,
        Self: Sized,
    {
        matches!(self.partial_cmp(other), Some(Ordering::Greater | Ordering::Equal))
    }
    fn is_sorted(self) -> bool
    where
        Self: Sized,
        Self::Item: PartialOrd,
    {
        self.is_sorted_by(PartialOrd::partial_cmp)
    }
    fn is_sorted_by<F>(mut self, compare: F) -> bool
    where
        Self: Sized,
        F: FnMut(&Self::Item, &Self::Item) -> Option<Ordering>,
    {
        fn check<'a, T>(
            last: &'a mut T,
            mut compare: impl FnMut(&T, &T) -> Option<Ordering> + 'a,
        ) -> impl FnMut(T) -> bool + 'a {
            move |curr| {
                if let Some(Ordering::Greater) | None() = compare(&last, &curr) {
                    return false;
                }
                *last = curr;
                true
            }
        }
        let mut last = match self.next() {
            Some(e) => e,
            None() => return true,
        };
        self.all(check(&mut last, compare))
    }
    fn is_sorted_by_key<F, K>(self, f: F) -> bool
    where
        Self: Sized,
        F: FnMut(Self::Item) -> K,
        K: PartialOrd,
    {
        self.map(f).is_sorted()
    }
    unsafe fn __iterator_get_unchecked(&mut self, _idx: usize) -> Self::Item
    where
        Self: TrustedRandomAccessNoCoerce,
    {
        unreachable!("Always specialized");
    }
}
```
*/
export abstract class CrabIterator<Item> {
    *[Symbol.iterator](): Iterator<Item> {
        let item = this.next();
        while (item.isSome()) {
            yield item.unwrap();
            item = this.next();
        }
    }
    abstract next(): Option<Item>;
    sizeHint(): [number, Option<number>] {
        return [0, None()];
    }
    fold<B>(init: B, f: (accum: B, item: Item) => B): B {
        let accum = init;
        let item = this.next();
        while (item.isSome()) {
            accum = f(accum, item.unwrap());
        }
        return accum;
    }
    count(): number {
        return this.fold(0, (count, _) => count + 1);
    }
    last(): Option<Item> {
        return this.fold(None(), (_, item) => Some(item as any));
    }
    advanceBy(n: number): Result<void, number> {
        for (let i = 0; i < n; i++) {
            if (this.next().isNone()) {
                return Err(n - i);
            }
        }
        return Ok(undefined);
    }
    nth(n: number): Option<Item> {
        const r = this.advanceBy(n).ok();
        if (r.isNone()) {
            return None();
        }
        return this.next();
    }
    stepBy(step: number): StepBy<this, Item> {
        return new StepBy(this, step);
    }
    chain<U extends CrabIterator<Item>>(other: U): Chain<this, U, Item> {
        return new Chain(this, other);
    }
    zip<U extends CrabIterator<X>, X>(other: U): Zip<this, U, Item, X> {
        return new Zip(this, other);
    }
    intersperse(separator: Item): Intersperse<this, Item> {
        return new Intersperse(this, separator);
    }
    map<B>(f: (item: Item) => B): RustMap<this, B, Item> {
        return new RustMap(this, f);
    }
    filter(predicate: (item: Item) => boolean): Filter<this, Item> {
        return new Filter(this, predicate);
    }
    filterMap<B>(f: (item: Item) => Option<B>): FilterMap<this, B, Item> {
        return new FilterMap(this, f);
    }
    enumerate(): Enumerate<this, Item> {
        return new Enumerate(this);
    }
    peekable(): Peekable<Item> {
        return new Peekable(this);
    }
    skipWhile(predicate: (item: Item) => boolean): SkipWhile<this, Item> {
        return new SkipWhile(this, predicate);
    }
    takeWhile(predicate: (item: Item) => boolean): TakeWhile<this, Item> {
        return new TakeWhile(this, predicate);
    }
    mapWhile<B>(predicate: (item: Item) => Option<B>): MapWhile<this, typeof predicate, Item> {
        return new MapWhile(this, predicate) as any;
    }
    skip(n: number): Skip<this, Item> {
        return new Skip(this, n);
    }
    take(n: number): Take<this, Item> {
        return new Take(this, n);
    }
    scan<St, B>(
        initialState: St,
        f: (state: St, item: Item) => Option<B>,
    ): Scan<this, St, B, Item> {
        return new Scan(this, initialState, f);
    }
    flatMap<U extends CrabIterator<Item>>(f: (item: Item) => U): FlatMap<this, U, Item> {
        return new FlatMap(this, f);
    }
    flatten(): Flatten<
        this extends CrabIterator<CrabIterator<any>>
            ? CrabIterator<Item extends CrabIterator<any> ? Item : never>
            : never,
        Item extends CrabIterator<any> ? Item : never,
        Item extends CrabIterator<infer Y> ? Y : never
    > {
        return new Flatten(this as any);
    }
}

class Flatten<I extends CrabIterator<X>, X extends CrabIterator<Y>, Y> extends CrabIterator<Y> {
    iter: I;
    inner: Option<Y>;
    constructor(iter: I) {
        super();
        this.iter = iter;
        this.inner = None();
    }
    next(): Option<Y> {
        while (true) {
            if (this.inner.isSome()) {
                return this.inner.take();
            }
            const item = this.iter.next();
            if (item.isNone()) {
                return None();
            }
            this.inner = item.unwrap().next();
        }
    }
}

class FlatMap<I extends CrabIterator<X>, U extends CrabIterator<X>, X> extends CrabIterator<X> {
    iter: I;
    f: (item: X) => U;
    inner: Option<U>;
    constructor(iter: I, f: (item: X) => U) {
        super();
        this.iter = iter;
        this.f = f;
        this.inner = None();
    }
    next(): Option<X> {
        if (this.inner.isNone()) {
            const item = this.iter.next();
            if (item.isNone()) {
                return None();
            }
            this.inner = Some(this.f(item.unwrap()) as any);
        }
        const result = this.inner.unwrap().next();
        if (result.isNone()) {
            this.inner = None();
        }
        return result;
    }
}

class Scan<I extends CrabIterator<X>, St, B, X> extends CrabIterator<B> {
    iter: I;
    state: St;
    f: (state: St, item: X) => Option<B>;
    constructor(iter: I, state: St, f: (state: St, item: X) => Option<B>) {
        super();
        this.iter = iter;
        this.state = state;
        this.f = f;
    }
    next(): Option<B> {
        const item = this.iter.next();
        if (item.isNone()) {
            return None();
        }
        const result = this.f(this.state, item.unwrap());
        if (result.isNone()) {
            return None();
        }
        this.state = result.unwrap() as any;
        return result;
    }
}

class Take<I extends CrabIterator<X>, X> extends CrabIterator<X> {
    iter: I;
    n: number;
    constructor(iter: I, n: number) {
        super();
        this.iter = iter;
        this.n = n;
    }
    next(): Option<X> {
        if (this.n === 0) {
            return None();
        }
        this.n--;
        return this.iter.next();
    }
}

class Skip<I extends CrabIterator<X>, X> extends CrabIterator<X> {
    iter: I;
    n: number;
    constructor(iter: I, n: number) {
        super();
        this.iter = iter;
        this.n = n;
    }
    next(): Option<X> {
        if (this.n === 0) {
            return this.iter.next();
        }
        this.n--;
        return this.iter.next();
    }
}

class MapWhile<I extends CrabIterator<X>, B, X> extends CrabIterator<B> {
    iter: I;
    f: (item: X) => Option<B>;
    done: boolean;
    constructor(iter: I, f: (item: X) => Option<B>) {
        super();
        this.iter = iter;
        this.f = f;
        this.done = false;
    }
    next(): Option<B> {
        if (this.done) {
            return None();
        }
        const item = this.iter.next();
        if (item.isNone()) {
            this.done = true;
            return None();
        }
        const result = this.f(item.unwrap());
        if (result.isNone()) {
            this.done = true;
        }
        return result;
    }
}

class TakeWhile<I extends CrabIterator<X>, X> extends CrabIterator<X> {
    iter: I;
    predicate: (item: X) => boolean;
    done: boolean;
    constructor(iter: I, predicate: (item: X) => boolean) {
        super();
        this.iter = iter;
        this.predicate = predicate;
        this.done = false;
    }
    next(): Option<X> {
        if (this.done) {
            return None();
        }
        const item = this.iter.next();
        if (item.isNone() || !this.predicate(item.unwrap())) {
            this.done = true;
            return None();
        }
        return item;
    }
}

class SkipWhile<I extends CrabIterator<X>, X> extends CrabIterator<X> {
    iter: I;
    predicate: (item: X) => boolean;
    done: boolean;
    constructor(iter: I, predicate: (item: X) => boolean) {
        super();
        this.iter = iter;
        this.predicate = predicate;
        this.done = false;
    }
    next(): Option<X> {
        let item = this.iter.next();
        if (this.done) {
            return item;
        }
        while (item.isSome() && this.predicate(item.unwrap())) {
            item = this.iter.next();
        }
        this.done = true;
        return item;
    }
}

class Peekable<X> extends CrabIterator<X> {
    iter: CrabIterator<X>;
    peeked: Option<X>;
    constructor(iter: CrabIterator<X>) {
        super();
        this.iter = iter;
        this.peeked = None();
    }
    next(): Option<X> {
        if (this.peeked.isSome()) {
            return this.peeked.take();
        }
        return this.iter.next();
    }
    peek(): Option<X> {
        if (this.peeked.isNone()) {
            this.peeked = this.iter.next();
        }
        return this.peeked;
    }
}

class Enumerate<I extends CrabIterator<X>, X> extends CrabIterator<[number, X]> {
    iter: I;
    index: number;
    constructor(iter: I) {
        super();
        this.iter = iter;
        this.index = 0;
    }
    next(): Option<[number, X]> {
        const item = this.iter.next();
        if (item.isNone()) {
            return None();
        }
        return Some([this.index++, item.unwrap() as any]);
    }
}

class FilterMap<I extends CrabIterator<X>, B, X> extends CrabIterator<B> {
    iter: I;
    f: (item: X) => Option<B>;
    constructor(iter: I, f: (item: X) => Option<B>) {
        super();
        this.iter = iter;
        this.f = f;
    }
    next(): Option<B> {
        return this.iter.next().andThen(this.f);
    }
}

class Filter<I extends CrabIterator<X>, X> extends CrabIterator<X> {
    iter: I;
    predicate: (item: X) => boolean;
    constructor(iter: I, predicate: (item: X) => boolean) {
        super();
        this.iter = iter;
        this.predicate = predicate;
    }
    next(): Option<X> {
        const item = this.iter.next();
        if (item.isNone()) {
            return None();
        }
        if (this.predicate(item.unwrap())) {
            return item;
        }
        return this.next();
    }
}

class RustMap<I extends CrabIterator<X>, B, X> extends CrabIterator<B> {
    iter: I;
    f: (item: X) => B;
    constructor(iter: I, f: (item: X) => B) {
        super();
        this.iter = iter;
        this.f = f;
    }
    next(): Option<B> {
        return this.iter.next().map(this.f);
    }
}

/**
 * An iterator adapter that places a separator between all elements.
 */
class Intersperse<I extends CrabIterator<X>, X> extends CrabIterator<X> {
    separator: X;
    iter: Peekable<I>;
    needsSeparator: boolean;
    constructor(iter: I, separator: X) {
        super();
        this.separator = separator;
        this.iter = iter.peekable() as any;
        this.needsSeparator = false;
    }
    next(): Option<X> {
        // if self.needs_sep && self.iter.peek().is_some() {
        //     self.needs_sep = false;
        //     Some(self.separator.clone())
        // } else {
        //     self.needs_sep = true;
        //     self.iter.next()
        // }

        if (this.needsSeparator && this.iter.peek().isSome()) {
            this.needsSeparator = false;
            return Some(this.separator as any);
        } else {
            this.needsSeparator = true;
            return this.iter.next() as any;
        }
    }
}

class Zip<I extends CrabIterator<X>, U extends CrabIterator<Y>, X, Y> extends CrabIterator<[X, Y]> {
    iter1: I;
    iter2: U;
    len: number;
    constructor(iter1: I, iter2: U) {
        super();
        this.iter1 = iter1;
        this.iter2 = iter2;
        this.len = Math.min(iter1.count(), iter2.count());
    }
    next(): Option<[X, Y]> {
        const x = this.iter1.next();
        const y = this.iter2.next();
        if (x.isNone() || y.isNone()) {
            return None();
        }
        return Some([x.unwrap(), y.unwrap()]) as any;
    }
    sizeHint(): [number, Option<number>] {
        const [min1, max1] = this.iter1.sizeHint();
        const [min2, max2] = this.iter2.sizeHint();
        const min = Math.min(min1, min2);
        const max = max1.or(max2);
        return [min, max];
    }
    size(): number {
        return this.len;
    }
}

class Chain<I extends CrabIterator<X>, U extends CrabIterator<X>, X> extends CrabIterator<X> {
    iter1: I;
    iter2: U;
    constructor(iter1: I, iter2: U) {
        super();
        this.iter1 = iter1;
        this.iter2 = iter2;
    }
    next() {
        return this.iter1.next().or(this.iter2.next());
    }
}

class StepBy<I extends CrabIterator<X>, X> extends CrabIterator<X> {
    iter: I;
    step: number;
    firstTake: boolean;
    constructor(iter: I, step: number) {
        super();
        this.iter = iter;
        this.step = step - 1;
        this.firstTake = true;
    }
    next() {
        const stepSize = this.firstTake ? 0 : this.step;
        this.firstTake = false;
        return this.iter.nth(stepSize);
    }
}
