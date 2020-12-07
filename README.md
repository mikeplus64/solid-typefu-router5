# solid-typefu-router5

This package provides a router with integration with
[router5](https://router5.js.org/) and
[solid-js](https://github.com/ryansolid/solid), and features type safe router
and link creation. Requires TypeScript 4.1+.

## Features

- Typed links
- Typed link parameters
- Typed routing

## Usage

In order to generate the types for type-safe links and routing, you must take
care to give TypeScript the narrowest possible type for your routes. The easiest
way to do this is simply adding `as const` to your routes definition. Please see
the example at
https://github.com/mikeplus64/solid-typefu-router5/blob/master/example/src/index.tsx
