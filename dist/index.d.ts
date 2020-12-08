import { Router as Router5, Route } from "router5";
import { DefaultDependencies } from "router5/dist/types/router";
import { Unsubscribe } from "router5/dist/types/base";
import { JSX } from "solid-js";
import { RoutesLike, Descend, RouteMeta, ReadRoutes } from "./types";
import { LinkNav, LinkProps } from "./components/Link";
import { RSM } from "./components/RouteTree";
import { ElementOf } from "ts-essentials";
export { MatchRoute, ShowRoute, SwitchRoutes } from "./components/MatchRoute";
export { default as Context, useRoute, useIsActive, isActive } from "./context";
export type { ReadRoutes, ParseParams } from "./types";
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
export interface SolidRouter<Deps, RM extends RouteMeta[]> {
    Provider(props: {
        children: JSX.Element;
    }): JSX.Element;
    /** See [[createLink]] */
    Link(props: LinkProps<ElementOf<RM>>): JSX.Element;
    /** See [[RouteStateMachine]] */
    Router<AssumePath extends ElementOf<RM>["name"] | undefined>(props: {
        children: RSM<AssumePath extends string ? Descend<AssumePath, RM> : RM>;
        assume?: AssumePath;
    }): JSX.Element;
    navigate(link: LinkNav<ElementOf<RM>>): void;
    router: Router5<Deps>;
}
export default function createSolidRouter<Routes extends RoutesLike<Deps>, Deps = DefaultDependencies>(config: {
    createRouter5: (routes: Route<Deps>[]) => Router5<Deps> | [Router5<Deps>, ...Unsubscribe[]];
    routes: Routes;
    onStart?: (router: Router5<Deps>) => void;
    linkNavActiveClass?: string;
    back?: () => void;
    forward?: () => void;
}): SolidRouter<Deps, ReadRoutes<Routes> extends infer I ? I extends RouteMeta[] ? I : never : never>;
//# sourceMappingURL=index.d.ts.map