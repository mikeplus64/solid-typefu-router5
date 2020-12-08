import { State as RouteState, Router as Router5, Route } from "router5";
import { Unsubscribe } from "router5/dist/types/base";
import { State } from "solid-js";
import { DeepReadonly } from "ts-essentials";
export interface RouterState {
    route: RouteState & {
        nameArray: string[];
    };
    previousRoute: undefined | RouteState;
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
export declare type RenderRouteName<A> = A extends [infer X] ? X : A extends [infer X, ...infer XS] ? X extends string ? XS extends string[] ? `${X}.${RenderRouteName<XS>}` : never : never : A extends string ? A : "";
export declare type RouteArrayOf<A> = A extends readonly (infer U)[] ? U extends {
    name: infer Name;
    children: infer Children;
} ? Children extends {} ? ToRouteArray<Name> | [...ToRouteArray<Name>, ...RouteArrayOf<Children>] : ToRouteArray<Name> : U extends {
    name: infer Name;
} ? ToRouteArray<Name> : [] : [];
export declare type RouteNameOf<A> = RenderRouteName<RouteArrayOf<A>>;
export declare type ToRouteArray<A> = A extends string ? A extends `${infer X}.${infer XS}` ? [X, ...ToRouteArray<XS>] : [A] : [];
export declare type ToRouteNestedArray<A> = A extends string ? A extends `${infer X}.${infer XS}` ? [X, ToRouteArray<XS>] : [A] : [];
export declare type AsParam<ParamName extends string> = {
    [P in ParamName]: string;
};
export declare type AsOptParam<ParamName extends string> = {
    [P in ParamName]?: string | undefined;
};
/**
 * Parse a router5 path into its params
 *
 * See https://router5.js.org/guides/path-syntax
 */
declare type ParseParams_<A extends string, Acc> = A extends `:${infer Param}<${any}>/${infer Tail}` ? ParseParams_<Tail, Acc & AsParam<Param>> : A extends `:${infer Param}<${any}>` ? Acc & AsParam<Param> : A extends `:${infer Param}/${infer Tail}` ? ParseParams_<Tail, Acc & AsParam<Param>> : A extends `:${infer Param}` ? AsParam<Param> : A extends `;${infer Param}<${any}>/${infer Tail}` ? ParseParams_<Tail, Acc & AsOptParam<Param>> : A extends `;${infer Param}<${any}>` ? Acc & AsOptParam<Param> : A extends `;${infer Param}/${infer Tail}` ? ParseParams_<Tail, Acc & AsOptParam<Param>> : A extends `;${infer Param}` ? Acc & AsOptParam<Param> : A extends `${any}?:${infer Param}/${infer Tail}` ? ParseParams_<Tail, Acc & AsOptParam<Param>> : A extends `${any}?:${infer Param}` ? Acc & AsOptParam<Param> : A extends `${any}?${infer Param}/${infer Tail}` ? ParseParams_<Tail, Acc & AsOptParam<Param>> : A extends `${any}?${infer Param}` ? Acc & AsOptParam<Param> : A extends `*${infer Param}` ? {
    [P in Param]?: string[];
} : A extends `/${infer Tail}` ? ParseParams_<Tail, Acc> : A extends `${any}/${infer Tail}` ? ParseParams_<Tail, Acc> : Acc;
export declare type ParseParams<A extends string> = ParseParams_<A, {}> extends infer P ? {
    [K in keyof P]: P[K];
} : never;
/**
 * Takes your `routes` and produces type metadata for consumption in this
 * library. The result is an array of [[RouteMeta]], one for each route.
 */
export declare type ReadRoutes<Tree extends RoutesLike<any>> = ReadRoutesArr__<Tree, [
], [
]>;
declare type ReadRoutesArr__<Tree, NameAcc extends string[], PathAcc extends string[]> = Tree extends readonly [infer Node, ...infer Tail] ? Node extends {
    name: infer Name;
    path: infer Path;
    children?: infer Children;
} ? Name extends string ? Path extends string ? [
    {
        name: Intercalate<[...NameAcc, Name], ".">;
        path: Concat<[...PathAcc, Path]>;
        params: ParseParams<Concat<[...PathAcc, Path]>>;
    },
    ...ReadRoutesArr__<Children, [
        ...NameAcc,
        Name
    ], [
        ...PathAcc,
        Path
    ]>,
    ...ReadRoutesArr__<Tail, NameAcc, PathAcc>
] : never : never : never : [];
/**
 * The shape of the return type of [[ReadRoutes]]
 */
export interface RouteMeta {
    name: string;
    path: string;
    params: {};
}
export declare type OptionalNestedPathTo<Path, Dest> = Path extends [
    infer X,
    ...infer XS
] ? X extends string | number | symbol ? {
    [_ in X]?: OptionalNestedPathTo<XS, Dest>;
} : never : Dest;
export declare type Descend<Path, RM> = RM extends [infer R, ...infer RS] ? [
    ...(R extends {
        name: infer Name;
    } ? Name extends string ? Path extends string ? StartsWith<Name, Path> extends true ? [R] : [] : never : never : never),
    ...Descend<Path, RS>
] : [];
/****************
 * Utility types
 ****************/
declare type StartsWith<Str extends string, Start extends string> = Str extends Start ? true : Str extends `${Start}.${any}` ? true : false;
declare type Str<A> = A extends string ? A : never;
declare type Strs<A> = A extends string[] ? A : never;
export declare type Concat<T extends string[]> = T extends [infer X, ...infer XS] ? `${Str<X>}${Concat<Strs<XS>>}` : "";
export declare type Intercalate<T extends string[], Sep extends string> = T extends [
    infer X
] ? X : T extends [infer X0, infer X1, ...infer XS] ? `${Str<X0>}${Sep}${Str<X1>}${Intercalate<Strs<XS>, Sep>}` : "";
export {};
//# sourceMappingURL=types.d.ts.map