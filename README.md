# solid-typefu-router5

This package provides a router with integration with
[router5](https://router5.js.org/) and
[solid-js](https://github.com/ryansolid/solid), and features type safe router
and link creation. Requires TypeScript 4.0+.

## Usage

In order to generate the types for type-safe links and routing, you must take
care to give TypeScript the narrowest possible type for your routes. The easiest
way to do this is simply adding `as const` to your routes definition.

### Example router definition file `mycoolproject/src/router.ts`

```typescript
import createSolidRouter from 'solid-typefu-router5';
import createRouter, { State as RouteState } from 'router5';
import browserPluginFactory from 'router5-plugin-browser';
/*
 * The shape of each node here should match router5's `RouteNode` which is, as
 * of writing:
 *
interface Route<Dependencies extends DefaultDependencies = DefaultDependencies> {
    name: string;
    path: string;
    canActivate?: ActivationFnFactory<Dependencies>;
    forwardTo?: string;
    children?: Array<Route<Dependencies>>;
    encodeParams?(stateParams: Params): Params;
    decodeParams?(pathParams: Params): Params;
    defaultParams?: Params;
}
 * See router5's documentation for more info.
 */

const routes = [
  { name: 'home', path: '/' },
  { name: 'users', path: '/users/', children: [
    { name: 'self', path: '/self' },
    { name: 'other', path: '/:id },
  ] },
] as const;

export const {
  /* Note that the type of your router's Link will prevent invalid routes from being specified
   * examples:
   * <Link to={['users', 'self']}>Profile</Link>
   * <Link nav to="home">Home</Link> 
   */
  Link,
  Provider,
  Router,
  hints,
} = createSolidRouter(routes, (routes) => {
  const router = createRouter(routes, { allowNotFound: true });
  router.usePlugin(browserPluginFactory({ useHash: false }));
  return router;
});

type Hints = typeof hints;
export type RouteName = Hints['name'];
export type Routes = Hints['routes'];
export type RouteTree = Hints['tree'];
```

### Example use of your custom router `mycoolproject/src/App.tsx`

```typescript
import { Router, Provider as RouterProvider } from './router';
import { useRoute } from 'solid-typefu-router5';
import Home from './components/Home';
import User from './components/Home';

export default () => 
  const getRoute = useRoute();
  return (
    <Provider>
      <Router>
        {{
          home: { render: Home },
          users: owned => owned({
            render: User,
            defaultProps: { id: undefined, self: false },
            props: {
              profile: { id: () => getRoute().params.id },
              self: { self: () => true }
            },
          }),
        }}
      </Router>
    </Provider>);
```
