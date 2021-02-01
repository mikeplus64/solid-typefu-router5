import { JSX } from "solid-js";
import { Descend, RouteLike, RouteMeta } from "../types";
import { Any, List, Object } from "ts-toolbelt";
import { UnionToIntersection } from "ts-essentials";
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
export declare type RSM<RM extends RouteMeta[], Path extends string = ""> = Path extends "" ? RSM_<RM, undefined> : Descend<Path, RM> extends infer Inner ? Inner extends RouteMeta[] ? RSM_<Inner, Inner[number]["params"]> : never : never;
declare type RSM_<RM extends RouteMeta[], P0> = RouterRenderNode<P0> & Any.Compute<UnionToIntersection<{
    [K in keyof RM]: RM[K] extends infer R ? R extends {
        nameArray: infer Name;
        params: infer Params;
    } ? Object.P.Record<Extract<Name, string[]>, RouterRenderNode<Params>, [
        "?",
        "W"
    ]> : never : never;
}[List.Keys<RM>]>>;
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
export {};
//# sourceMappingURL=Router.d.ts.map