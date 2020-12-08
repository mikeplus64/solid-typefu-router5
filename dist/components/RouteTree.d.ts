import { JSX } from "solid-js";
import { OptionalNestedPathTo, RouteLike, RouteMeta, ToRouteArray } from "../types";
/**
 * Tells `solid-typefu-router5` how to render a node if the path leading to
 * it matches the current route name.
 */
export declare type RouterRenderNode<Params> = {
    /** Defaults to rendering the children. */
    render?: (props: {
        children?: JSX.Element;
        params: Params;
    }) => JSX.Element;
    /** Fallback children to use if none are available to give to [[render]]. Default: nothing */
    fallback?: (props: {
        params: Params;
    }) => JSX.Element;
};
export declare type RSM<RM extends RouteMeta[]> = RM extends [infer R, ...infer RS] ? R extends {
    name: infer Name;
    params: infer Params;
} ? RS extends RouteMeta[] ? OptionalNestedPathTo<ToRouteArray<Name>, RouterRenderNode<Params>> & RSM<RS> : never : never : {};
export declare type RenderNodeLike = RouterRenderNode<any>;
export declare type RouteNodeLike = {
    name: string;
    children?: RouteTreeLike;
};
export declare type RouteTreeLike = RouteNodeLike[];
export declare type RenderTreeLike = RenderNodeLike & {
    [k: string]: RenderTreeLike;
};
/**
 * Given a tree of routes and render instructions for each route, return an
 * element that selects the correct renderer for the current route.
 *
 * Also supports using routes to choose how to provide props to a single
 * renderer.
 */
export default function RouteStateMachine<T extends RenderTreeLike, A extends RouteLike>(tree: T, _assumed?: A): JSX.Element;
//# sourceMappingURL=RouteTree.d.ts.map