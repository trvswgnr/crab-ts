# Crab TS

> [!WARNING]  
> This project is just something I'm doing for fun. It is not—and may not ever be—meant for use in any serious capacity.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [StdIterator](#stditerator)
  - [Chain](#chain)
  - [Traits](#traits)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Introduction

`crab-ts` is a TypeScript library that brings ~~Rust~~CrabLang's standard library to the TypeScript ecosystem. This includes the implementation of various Rust features like iterators, chain methods, and useful data structures. The library uses advanced TypeScript features to provide type-safe yet flexible APIs akin to Rust's standard library.

## Features

- **StdIterator**: A class that provides a TypeScript implementation of Rust's `Iterator` trait.
- **Chain**: Provides a `.chain()` method to chain iterators.
- **Traits**: Includes interfaces for common Rust traits like `IntoIterator`, `Clone`, `Debug`, `Display`, and more.
- **Doubly Linked List**: Efficient implementation of a doubly-linked list data structure.
- **Extendable**: Designed to be easily extendable with custom iterators and data structures.

## Installation

not yet published to npm... coming soon!

## Usage

### StdIterator

`StdIterator` serves as the foundational class for all iterators in `crab-ts`. It mimics Rust's `Iterator` trait and provides several methods to manipulate and query data streams.

```ts
import { StdIterator } from 'crab-ts';

class MyIterator extends StdIterator<number> {
  // Implementation here
}
```

### Chain

`Chain` allows you to concatenate two iterators, providing a unified API to iterate through both.

```ts
import { StdIterator, Chain } from 'crab-ts';

const iterator1 = new MyIterator();
const iterator2 = new MyIterator();

const chained = new Chain(iterator1, iterator2);
```

### Traits

Utility traits like `Option`, `Result`, and `IntoIterator` are provided for easier manipulation of data and error handling.

```ts
import { Option, Result, IntoIterator } from 'crab-ts';
```

## Examples

coming soon!

## Contributing

If you'd like to contribute, please fork the repository and create a pull request, or open an issue for discussion. This project currently uses [Bun](https://bun.sh) for development, and relies on it for unit tests.

## License

This project is licensed under the MIT License.
