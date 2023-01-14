import { JSX } from "solid-js";
import { Any, Object, String, Union } from "ts-toolbelt";
import { RenderTreeLike, RouteMeta, RouterRenderNode } from "../types";
export declare type RSM<RM extends [...RouteMeta[]], Path extends string[] | string | undefined = undefined> = Path extends string ? Object.Path<_RSM0<RM>, String.Split<Path, ".">> : Path extends string[] ? Object.Path<_RSM0<RM>, Path> : _RSM0<RM>;
declare type _RSM0<RM extends [...RouteMeta[]]> = _RSM<RM> & RouterRenderNode<{}>;
declare type _RSM<RM extends [...RouteMeta[]]> = Any.Compute<Union.IntersectOf<{
    [K in keyof RM]: Object.P.Record<Extract<RM[K], RouteMeta>["nameArray"], RouterRenderNode<Extract<RM[K], RouteMeta>["params"]>, [
        "?",
        "W"
    ]>;
}[number]>>;
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