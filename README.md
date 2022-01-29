# solid-typefu-router5

This package provides a router with integration with
[router5](https://router5.js.org/) and
[solid-js](https://github.com/ryansolid/solid), and features type safe router
and link creation. Requires TypeScript 4.1+.

## Features

- Type-safe links
- Type-safe link parameters
- Type-safe routing

## Example Usage

- https://github.com/mikeplus64/solid-typefu-router5/blob/master/example/src/index.tsx

## Quick Start

- Create some routes that are in the shape [[`RouteTreeLike`]]. See the Router5
  documentation for what route objects can look like.

- Use [[`createSolidRouter`]] on those routes

- Enjoy your type-safe `Link` and `Router` components
