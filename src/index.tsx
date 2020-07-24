import { State as RouteState, Router as Router5, Route } from 'router5';
import { createSignal, createEffect, createMemo } from 'solid-js';

import { SharedRouterValue, RoutesLike } from './types';
import Context from './context';
import createLink, { LinkConfig, LinkProps, RouteNameOf } from './components/Link';
import RouteStateMachine, { RenderTreeOf, RenderTreeLike } from './components/RouteTree';
import { DefaultDependencies } from 'router5/dist/types/router';

export { LinkNav, LinkConfig } from './components/Link';
export { MatchRoute, ShowRoute, SwitchRoutes } from './components/MatchRoute';
export { passthru } from './components/RouteTree';
export { useRoute, useRouteName, useActive, isActive } from './context';

export type { MatchRouteProps, ShowRouteProps } from './components/MatchRoute';
export type { LinkProps, RouteNameOf } from './components/Link';
export type { RenderTreeOf } from './components/RouteTree';
export type { RoutesLike, SharedRouterValue, RouterContextValue } from './types';

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
export default function createSolidRouter<Routes extends RoutesLike<Deps>, Deps = DefaultDependencies>(
  routes: Routes,
  createRouter5: (routes: Route<Deps>[]) => Router5<Deps>,
  onStart?: (router: Router5<Deps>) => void,
  linkConfig?: LinkConfig,
): {
  Provider(props: { children: JSX.Element }): JSX.Element,

  /** See [[createLink]] */
  Link(props: LinkProps<RouteNameOf<Routes>>): JSX.Element,

  /** See [[RouteStateMachine]] */
  Router(props: { children: RenderTreeOf<Routes> }): JSX.Element,

  /** Probably don't use this. */
  router: SharedRouterValue<Deps, Routes>,

  /**
   * Type hints you can use to give type names to aspects of your router like
   *
   * ```typescript
   * type Hints = typeof hints;
   * export type RouteName = Hints['name'];
   * ```
   */
  hints: Phantom<{
    routes: Routes,
    name: RouteNameOf<Routes>,
    tree: RenderTreeOf<Routes>
  }>,
} {
  const router5: Router5<Deps> = createRouter5(routes as any as Route<Deps>[]);
  // yolo, hopefully router5 doesn't actually mutate routes =)

  const self: SharedRouterValue<Deps, Routes> = { routes, router5 };
  Object.freeze(self);

  return {
    Link: createLink(self, linkConfig),

    Router(props: { children: RenderTreeOf<Routes> }): JSX.Element {
      return RouteStateMachine(props.children as RenderTreeLike);
    },

    Provider(props: { children: JSX.Element }): JSX.Element {
      const initialState = router5.getState() ?? { name: '' };
      const [getRoute, setRoute] = createSignal<RouteState>(initialState);

      const getRouteName = createMemo(() => getRoute().name, initialState.name, (a, b) => a === b);
      const getSplitRouteName = createMemo(() => getRouteName().split('.'), initialState.name.split('.'));

      const value = {
        getRoute,
        getRouteName: getSplitRouteName,
        getRouteNameRaw: getRouteName,
        router: self as SharedRouterValue<unknown, unknown>,
      };

      createEffect(() => {
        router5.subscribe((state) => setRoute(state.route));
        router5.start();
        if (typeof onStart === 'function') onStart(router5);
      });

      return (
        <Context.Provider value={value}>
          {props.children}
        </Context.Provider>);
    },
    router: self,
    hints: {} as any,
  };
}

export type Phantom<T> = { __phantom__: never } & T;
