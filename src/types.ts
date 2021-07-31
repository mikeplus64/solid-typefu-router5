import { State as R5RouteState, Router as Router5, Route } from "router5";
import { Unsubscribe } from "router5/dist/types/base";
import { Store } from "solid-js/store";
import { Any, Object, String, Union } from "ts-toolbelt";

export interface RouteState extends R5RouteState {
  nameArray: string[];
}

export interface RouterState {
  route: RouteState;
  previousRoute: undefined | R5RouteState;
}

export interface RouterConfig<Deps, Routes> {
  createRouter5: (
    routes: Route<Deps>[]
  ) => Router5<Deps> | [Router5<Deps>, ...Unsubscribe[]];
  onStart?: (router: Router5<Deps>) => void;
  routes: Routes;
  navActiveClass?: string;
  back?: () => void;
  forward?: () => void;
}

export interface RouterContextValue<Deps = any, Routes = any> {
  state: Store<RouterState>;
  /** Use this to make your own custom 'Link', buttons, navigation, etc. */
  router: Router5<Deps>;
  config: RouterConfig<Deps, Routes>;
}

export type RouteLike = string;
export type RoutesLike<Deps> = readonly Object.Readonly<
  Route<Deps>,
  Any.Key,
  "deep"
>[];

/**
 * Parse a route name ("foo.bar") into its components (["foo", "bar"])
 */
export type ToRouteArray<A extends string> = String.Split<A, ".">;

export type AsParam<ParamName extends string> = { [P in ParamName]: string };

export type AsOptParam<ParamName extends string> = {
  [P in ParamName]?: string | undefined;
};

/**
 * Parse a router5 path into its params
 *
 * See https://router5.js.org/guides/path-syntax
 */
export type ParseParams<Path extends string> = String.Split<
  Path,
  "/"
> extends infer Segs
  ? Any.Compute<Union.IntersectOf<ParseSeg<Segs[keyof Segs]>>>
  : never;

type ParseSeg<Path> =
  // if there is a nicer way of writing this let me know please
  Path extends `${infer Prefix}?${infer Params}`
    ? ParseSegParams<`?${Params}`, ParseSegParams<Prefix>>
    : Path extends `${infer Prefix}&${infer Params}`
    ? ParseSegParams<`&${Params}`, ParseSegParams<Prefix>>
    : Path extends `${infer Prefix}:${infer Params}`
    ? ParseSegParams<`:${Params}`, ParseSegParams<Prefix>>
    : Path extends `${infer Prefix};${infer Params}`
    ? ParseSegParams<`;${Params}`, ParseSegParams<Prefix>>
    : {};

type ParseSegParams<A, Acc = {}> = A extends ""
  ? Acc
  : // url param w regex
  A extends `:${infer Param}<${any}>`
  ? Acc & AsParam<Param>
  : // url param
  A extends `:${infer Param}`
  ? Acc & AsParam<Param>
  : // matrix params w regex
  A extends `;${infer Param}<${any}>${infer Tail}`
  ? ParseSegParams<Tail, Acc & AsOptParam<Param>>
  : // matrix params
  A extends `;${infer Param}${infer Tail}`
  ? ParseSegParams<Tail, Acc & AsOptParam<Param>>
  : // query parameters
  A extends `?${infer QP}`
  ? QP extends `:${infer QP1}`
    ? _ParseQueryParams1<QP1, Acc, ":">
    : _ParseQueryParams1<QP, Acc, "">
  : // splat parameters (only supports it at the end of a path)
  A extends `*${infer Param}`
  ? { [P in Param]?: string[] }
  : Acc;

/**
 * Begin parsing query parameters starting at a parameter that has already had
 * the leading ? or ?: consumed. So if the path is "/foo?page&id" the input to
 * this is expected to be "page&id"
 */
type _ParseQueryParams1<
  QP,
  Acc = {},
  ParamSfix extends string = ""
> = QP extends `${infer Param}&${ParamSfix}${infer Tail}`
  ? _ParseQueryParams1<Tail, Acc & AsOptParam<Param>, ParamSfix>
  : QP extends `${infer Param}`
  ? Acc & AsOptParam<Param>
  : Acc;

/**
 * Takes your `routes` and produces type metadata for consumption in this
 * library. The result is an array of [[RouteMeta]], one for each route.
 */
export type ReadRoutes<Tree> = _RouteQueue<Tree> extends infer Q
  ? _ReadRoutesQueue<Q>
  : never;

type _ReadRoutesQueue<Q, Acc extends any[] = []> = Q extends [
  infer X,
  ...infer XS
]
  ? _ReadRoutesQueue<XS, [...Acc, _ReadRoute<X>]>
  : Acc;

type _RouteQueue<
  Tree,
  Ctx extends any[] = [],
  Acc extends any[] = []
> = Tree extends readonly [infer Node, ...infer Tail]
  ? Node extends { children: infer Children }
    ? _RouteQueue<
        Tail,
        Ctx,
        _RouteQueue<Children, [...Ctx, Node], [...Acc, [...Ctx, Node]]>
      >
    : _RouteQueue<Tail, Ctx, [...Acc, [...Ctx, Node]]>
  : Acc;

type _ReadRoute<R> = R extends _RouteNode[]
  ? _MkName<R> extends infer Name
    ? {
        nameArray: Name;
        name: Intercalate<Name, ".">;
        params: ParseParams<Extract<Concat<_MkPath<R>>, string>>;
        paramsArray: Concat<_MkPath<R>>;
      }
    : never
  : never;

type _MkName<R extends _RouteNode[]> = {
  [K in keyof R]: K extends `${number}`
    ? Extract<R[K], _RouteNode>["name"]
    : R[K];
};

type _MkPath<R extends _RouteNode[]> = {
  [K in keyof R]: K extends `${number}`
    ? Extract<R[K], _RouteNode>["path"]
    : R[K];
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

/****************
 * Utility types
 ****************/

export type Concat<T, Acc extends string = ""> = T extends [
  infer X,
  ...infer XS
]
  ? Concat<Extract<XS, string[]>, `${Acc}${Extract<X, string>}`>
  : Acc;

export type Intercalate<T, Sep extends string> = T extends [infer X]
  ? X
  : T extends [infer X, ...infer XS]
  ? _Intercalate1<XS, Sep, `${Extract<X, string>}`>
  : "";

export type _Intercalate1<
  T,
  Sep extends string,
  Acc extends string
> = T extends [infer X]
  ? `${Acc}${Sep}${Extract<X, string>}`
  : T extends [infer X, ...infer XS]
  ? _Intercalate1<XS, Sep, `${Acc}${Sep}${Extract<X, string>}`>
  : Acc;
