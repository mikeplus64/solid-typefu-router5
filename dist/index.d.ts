import { Route, Router as Router5 } from "router5";
import { Unsubscribe } from "router5/dist/types/base";
import { DefaultDependencies } from "router5/dist/types/router";
import { JSX } from "solid-js";
import { LinkNav, LinkProps } from "./components/Link";
import { RSM } from "./components/Router";
import { ReadRoutes, RouteMeta, RoutesLike } from "./types";
export type { LinkNav } from "./components/Link";
export type { RSM } from "./components/Router";
export { MatchRoute, MatchRouteProps, ShowRoute, ShowRouteProps, SwitchRoutes, } from "./components/Switch";
export { default as Context, isActive, useIsActive, useRoute, RouteActive, } from "./context";
export type { ParseParams, ReadRoutes, RenderNodeLike, RenderTreeLike, RouteLike, RouteMeta, RouteNodeLike, RouterContextValue, RouterFallbackRenderFn, RouterRenderFn, RouterRenderNode, RoutesLike, RouteState, RouteTreeLike, } from "./types";
export interface RouterComponent<RM extends RouteMeta[]> {
    <AssumeRoute extends undefined | RM[number]["name" | "nameArray"] = undefined>(props: {
        children: RSM<RM, AssumeRoute>;
        assume?: AssumeRoute;
    }): JSX.Element;
}
export interface LinkComponent<RM extends RouteMeta[]> {
    (props: LinkProps<RM[number]>): JSX.Element;
}
export interface SolidRouter<Deps, RM extends RouteMeta[]> {
    Provider: (props: {
        children: JSX.Element;
    }) => JSX.Element;
    /** See [[RouteStateMachine]] */
    Router: RouterComponent<RM>;
    /** See [[createLink]] */
    Link: LinkComponent<RM>;
    navigate(link: LinkNav<RM[number]>): void;
    router: Router5<Deps>;
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
 * export const { Provider, Link, Router } = createSolidRouter({ routes, createRouter5, onStart });
 * ```
 */
export default function createSolidRouter<Routes extends RoutesLike<Deps>, RM extends ReadRoutes<Routes>, Deps = DefaultDependencies>(config: {
    createRouter5: (routes: Route<Deps>[]) => Router5<Deps> | [Router5<Deps>, ...Unsubscribe[]];
    routes: Routes;
    onStart?: (router: Router5<Deps>) => void;
    back?: () => void;
    forward?: () => void;
    defaultLinkProps?: LinkProps<RM[number]>;
}): SolidRouter<Deps, RM>;
//# sourceMappingURL=index.d.ts.map