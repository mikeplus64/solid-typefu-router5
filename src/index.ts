import { State as RouteState, Router as Router5, RouteNode } from 'router5';
import { createSignal, createEffect, createMemo } from 'solid-js';

import { SharedRouterValue } from './types';
import Context from './context';
import createLink, { LinkProps, RouteNameOf } from './components/Link';
import RouteStateMachine, { RenderTreeOf, RenderTreeLike } from './components/RouteTree';

export { LinkNav } from './components/Link';
export { MatchRoute, ShowRoute } from './components/MatchRoute';
export { passthru } from './components/RouteTree';

export type { MatchRouteProps, ShowRouteProps } from './components/MatchRoute';
export type { LinkProps, RouteNameOf } from './components/Link';
export type { RenderTreeOf } from './components/RouteTree';
export type { SharedRouterValue, RouterContextValue } from './types';

/**
 * Create a router for use in solid-js.
 *
 * I'd recommend putting your router in its own file like './router.ts', then
 * exporting the results of this function, like
 *
 * ```ts
 * import { createRouter, Router as Router5 } from 'router5';
 * import { createSolidRouter } from 'solid-ts-router';
 *
 * const routes = [
 *   ...
 * ] as const;
 *
 * // note the "as const" is very important! this causes TypeScript to infer
 * // `routes` as the narrowest possible type.
 *
 * function performInitialRedirect(router: Router5) {
 *   ...
 * }
 *
 * export const { Provider, Link, Router } = createSolidRouter(routes, routes => {
 *   return createRouter(routes, {...router5OptionsHere});
 * }, performInitialRedirect);
 * ```
 */
export default function createSolidRouter<Deps, Routes extends readonly RouteNode[]>(
  routes: Routes,
  createRouter5: (routes: RouteNode[]) => Router5<Deps>,
  onStart?: (router: Router5<Deps>) => void,
): {
  Provider(props: { children: JSX.Element }): JSX.Element,
  Link(props: LinkProps<RouteNameOf<Routes>>): JSX.Element,
  Router(props: { children: RenderTreeOf<Routes> }): JSX.Element,
  router: SharedRouterValue<Deps, Routes>
} {
  const router5: Router5<Deps> = createRouter5(routes as any as RouteNode[]);
  // yolo, hopefully router5 doesn't actually mutate routes =)

  const self: SharedRouterValue<Deps, Routes> = { routes, router5 };
  Object.freeze(self);

  return {
    Link: createLink(self),

    Router(props: { children: RenderTreeOf<Routes> }): JSX.Element {
      return RouteStateMachine(props.children as RenderTreeLike);
    },

    Provider(props: { children: JSX.Element }): JSX.Element {
      const initialState = router5.getState();
      const [getRoute, setRoute] = createSignal<RouteState>(initialState);

      // create a signal for just the name as a `string` since strings are very
      // easy to compare by `===`
      const [getRouteName, setRouteName] = createSignal<string>(initialState.name, (a, b) => a === b);
      const getSplitRouteName = createMemo<string[]>(
        () => getRouteName().split('.'),
        initialState.name.split('.'),
      );

      createEffect(() => {
        router5.subscribe((state) => {
          setRoute(state.route);
          setRouteName(state.route.name);
        });
        router5.start();
        if (typeof onStart === 'function') onStart(router5);
      });

      return Context.Provider({
        value: {
          getRoute,
          getRouteName: getSplitRouteName,
          router: self as SharedRouterValue<unknown, unknown>
        },
        children: props.children,
      });
    },

    router: self,
  };
}
