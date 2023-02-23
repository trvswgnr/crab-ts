# Rust's `Result` and `Option`, now in TypeScript!

Rust has great error handling. JavaScript does not. This library provides a TypeScript implementation of Rust's `Result` and `Option` types to change that.

**Note:** Unfortunately, JavaScript already uses the name `Option` for [a different purpose](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement/Option). This library instead uses the name `Maybe` to represent a value that is either `Some` or `None`, with `Optional` as the base class.
