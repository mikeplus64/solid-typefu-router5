import { JSX } from "solid-js";
import { Any, Object, Union, String } from "ts-toolbelt";
import { RouteMeta } from "../types";
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
export declare type RSM<RM extends [...RouteMeta[]], Path extends string[] | string | undefined = undefined> = Path extends string ? Object.Path<_RSM0<RM>, String.Split<Path, ".">> : Path extends string[] ? Object.Path<_RSM0<RM>, Path> : _RSM0<RM>;
declare type _RSM0<RM extends [...RouteMeta[]]> = _RSM<RM> & RouterRenderNode<undefined>;
declare type _RSM<RM extends [...RouteMeta[]]> = Any.Compute<Union.IntersectOf<{
    [K in keyof RM]: Object.P.Record<Extract<RM[K], RouteMeta>["nameArray"], RouterRenderNode<Extract<RM[K], RouteMeta>["params"]>, [
        "?",
        "W"
    ]>;
}[number]>>;
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
export default function RouteStateMachine<T extends RenderTreeLike, A extends string | string[]>(tree: T, _assumed?: A): JSX.Element;
export {};
//# sourceMappingURL=Router.d.ts.map