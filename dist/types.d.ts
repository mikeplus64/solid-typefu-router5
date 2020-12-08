import { State as R5RouteState, Router as Router5, Route } from "router5";
import { Unsubscribe } from "router5/dist/types/base";
import { State } from "solid-js";
import { DeepReadonly } from "ts-essentials";
export interface RouteState extends R5RouteState {
    nameArray: string[];
}
export interface RouterState {
    route: RouteState;
    previousRoute: undefined | R5RouteState;
}
export interface RouterConfig<Deps, Routes> {
    createRouter5: (routes: Route<Deps>[]) => Router5<Deps> | [Router5<Deps>, ...Unsubscribe[]];
    onStart?: (router: Router5<Deps>) => void;
    routes: Routes;
    navActiveClass?: string;
    back?: () => void;
    forward?: () => void;
}
export interface RouterContextValue<Deps = any, Routes = any> {
    state: State<RouterState>;
    /** Use this to make your own custom 'Link', buttons, navigation, etc. */
    router: Router5<Deps>;
    config: RouterConfig<Deps, Routes>;
}
export declare type RouteLike = string;
export declare type RoutesLike<Deps> = DeepReadonly<Route<Deps>[]>;
/**
 * Parse a route name ("foo.bar") into its components (["foo", "bar"])
 */
export declare type ToRouteArray<A> = _ToRouteArray<A>;
declare type _ToRouteArray<A> = A extends string ? A extends `${infer X}.${infer XS}` ? _ToRouteArray1<XS, [X]> : [A] : [];
declare type _ToRouteArray1<A, Acc extends string[]> = A extends string ? A extends `${infer X}.${infer XS}` ? _ToRouteArray1<XS, [...Acc, X]> : Acc : Acc;
export declare type AsParam<ParamName extends string> = {
    [P in ParamName]: string;
};
export declare type AsOptParam<ParamName extends string> = {
    [P in ParamName]?: string | undefined;
};
declare type QueryParamStart = "?:" | "&:" | "?" | "&";
/**
 * Parse a router5 path into its params
 *
 * See https://router5.js.org/guides/path-syntax
 */
export declare type ParseParams<A extends string, Acc = {}> = A extends `:${infer Param}<${any}>/${infer Tail}` ? ParseParams<Tail, Acc & AsParam<Param>> : A extends `:${infer Param}<${any}>` ? Acc & AsParam<Param> : A extends `:${infer Param}/${infer Tail}` ? ParseParams<Tail, Acc & AsParam<Param>> : A extends `:${infer Param}` ? AsParam<Param> : A extends `;${infer Param}<${any}>/${infer Tail}` ? ParseParams<Tail, Acc & AsOptParam<Param>> : A extends `;${infer Param}<${any}>` ? Acc & AsOptParam<Param> : A extends `;${infer Param}/${infer Tail}` ? ParseParams<Tail, Acc & AsOptParam<Param>> : A extends `;${infer Param}` ? Acc & AsOptParam<Param> : A extends `${any}${QueryParamStart}${infer Param}/${infer Tail}` ? ParseParams<Tail, Acc & AsOptParam<Param>> : A extends `${any}${QueryParamStart}${infer Param}` ? Acc & AsOptParam<Param> : A extends `*${infer Param}` ? {
    [P in Param]?: string[];
} : A extends `/${infer Tail}` ? ParseParams<Tail, Acc> : A extends `${any}/${infer Tail}` ? ParseParams<Tail, Acc> : Acc;
/**
 * Takes your `routes` and produces type metadata for consumption in this
 * library. The result is an array of [[RouteMeta]], one for each route.
 */
export declare type ReadRoutes<Tree> = _RouteQueue<Tree> extends infer Q ? _ReadRoutesQueue<Q> : never;
declare type _RouteQueue<Tree, Ctx extends any[] = [], Acc extends any[] = []> = Tree extends readonly [infer Node, ...infer Tail] ? Node extends {
    children: infer Children;
} ? _RouteQueue<Tail, Ctx, _RouteQueue<Children, [...Ctx, Node], [...Acc, [...Ctx, Node]]>> : _RouteQueue<Tail, Ctx, [...Acc, [...Ctx, Node]]> : Acc;
declare type _ReadRoutesQueue<Q, Acc extends any[] = []> = Q extends [
    infer X,
    ...infer XS
] ? _ReadRoutesQueue<XS, [...Acc, _ReadRoute<X>]> : Acc;
declare type _ReadRoute<R> = R extends _RouteNode[] ? _MkName<R> extends infer Name ? {
    nameArray: Name;
    name: Intercalate<Name, ".">;
    params: ParseParams<Extract<Concat<_MkPath<R>>, string>>;
} : never : never;
declare type _MkName<R extends _RouteNode[]> = {
    [K in keyof R]: K extends `${number}` ? Extract<R[K], _RouteNode>["name"] : R[K];
};
declare type _MkPath<R extends _RouteNode[]> = {
    [K in keyof R]: K extends `${number}` ? Extract<R[K], _RouteNode>["path"] : R[K];
};
interface _RouteNode {
    name: string;
    path: string;
}
/**
 * The shape of the return type of [[ReadRoutes]]
 */
export interface RouteMeta {
    name: string;
    nameArray: string[];
    params: {};
}
/**
 * Filter for routes that start with a specific path. The routes that fail to match get replaced with `never`
 */
export declare type Descend<Path extends string, RM extends RouteMeta[]> = {
    [K in keyof RM]-?: {
        1: never;
        0: RM[K];
    }[StartsWith<Extract<RM[K], RouteMeta>["name"], Path>];
};
/****************
 * Utility types
 ****************/
declare type StartsWith<Str, Start extends string> = Str extends Start ? 0 : Str extends `${Start}.${any}` ? 0 : 1;
export declare type Concat<T, Acc extends string = ""> = T extends [
    infer X,
    ...infer XS
] ? Concat<Extract<XS, string[]>, `${Acc}${Extract<X, string>}`> : Acc;
export declare type Intercalate<T, Sep extends string> = T extends [infer X] ? X : T extends [infer X, ...infer XS] ? _Intercalate1<XS, Sep, `${Extract<X, string>}`> : "";
export declare type _Intercalate1<T, Sep extends string, Acc extends string> = T extends [infer X] ? `${Acc}${Sep}${Extract<X, string>}` : T extends [infer X, ...infer XS] ? _Intercalate1<XS, Sep, `${Acc}${Sep}${Extract<X, string>}`> : Acc;
export {};
//# sourceMappingURL=types.d.ts.map