import { Router as Router5, Route } from 'router5';
import { SharedRouterValue, RoutesLike } from './types';
import { LinkProps, RouteNameOf } from './components/Link';
import { RenderTreeOf } from './components/RouteTree';
import { DefaultDependencies } from 'router5/dist/types/router';
export { LinkNav } from './components/Link';
export { MatchRoute, ShowRoute } from './components/MatchRoute';
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
export default function createSolidRouter<Routes extends RoutesLike<Deps>, Deps = DefaultDependencies>(routes: Routes, createRouter5: (routes: Route<Deps>[]) => Router5<Deps>, onStart?: (router: Router5<Deps>) => void): {
    Provider(props: {
        children: JSX.Element;
    }): JSX.Element;
    Link(props: LinkProps<RouteNameOf<Routes>>): JSX.Element;
    Router(props: {
        children: RenderTreeOf<Routes>;
    }): JSX.Element;
    router: SharedRouterValue<Deps, Routes>;
    hints: Phantom<{
        routes: Routes;
        name: RouteNameOf<Routes>;
        tree: RenderTreeOf<Routes>;
    }>;
};
export declare type Phantom<T> = {
    __phantom__: never;
} & T;
//# sourceMappingURL=index.d.ts.map