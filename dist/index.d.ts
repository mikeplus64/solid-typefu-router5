import { Router as Router5, Route } from 'router5';
import { DefaultDependencies } from 'router5/dist/types/router';
import { Unsubscribe } from 'router5/dist/types/base';
import { SharedRouterValue, RoutesLike } from './types';
import { LinkConfig, LinkProps, RouteNameOf } from './components/Link';
import { RenderTreeOf } from './components/RouteTree';
export { LinkNav, LinkConfig } from './components/Link';
export { MatchRoute, ShowRoute, SwitchRoutes } from './components/MatchRoute';
export { passthru } from './components/RouteTree';
export { useRoute, useRouteName, useIsActive, isActive } from './context';
export type { MatchRouteProps, ShowRouteProps } from './components/MatchRoute';
export type { LinkProps, RouteNameOf } from './components/Link';
export type { RenderTreeOf } from './components/RouteTree';
export type { RoutesLike, SharedRouterValue, RouterContextValue } from './types';
export interface Config<Deps> {
    createRouter5: (routes: Route<Deps>[]) => Router5<Deps> | [Router5<Deps>, ...Unsubscribe[]];
    onStart?: (router: Router5<Deps>) => void;
    link?: LinkConfig;
}
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
 * function createRouter5(routes: Route<Deps>[]): Router5 {
 *   return createRouter(...)
 * }
 *
 * function onStart(router: Router5): void {
 *   // initial redirect here
 *   ...
 * }
 *
 * export const { Provider, Link, Router } = createSolidRouter(routes, { createRouter5, onStart });
 * ```
 */
export default function createSolidRouter<Routes extends RoutesLike<Deps>, Deps = DefaultDependencies>(routes: Routes, { createRouter5, onStart, link: linkConfig, }: Config<Deps>): {
    Provider(props: {
        children: JSX.Element;
    }): JSX.Element;
    /** See [[createLink]] */
    Link(props: LinkProps<RouteNameOf<Routes>>): JSX.Element;
    /** See [[RouteStateMachine]] */
    Router(props: {
        children: RenderTreeOf<Routes>;
    }): JSX.Element;
    /** Probably don't use this. */
    router: SharedRouterValue<Deps, Routes>;
    /**
     * Type hints you can use to give type names to aspects of your router like
     *
     * ```typescript
     * type Hints = typeof hints;
     * export type RouteName = Hints['name'];
     * ```
     */
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