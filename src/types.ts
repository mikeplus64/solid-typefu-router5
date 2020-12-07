import { State as RouteState, Router as Router5, Route } from "router5";
import { Unsubscribe } from "router5/dist/types/base";
import { State } from "solid-js";
import { DeepReadonly } from "ts-essentials";

export interface RouterState {
  route: RouteState & { nameArray: string[] };
  previousRoute: undefined | RouteState;
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
  state: State<RouterState>;
  /** Use this to make your own custom 'Link', buttons, navigation, etc. */
  router: Router5<Deps>;
  config: RouterConfig<Deps, Routes>;
}

export type RouteLike = string;

export type RoutesLike<Deps> = DeepReadonly<Route<Deps>[]>;

export type RenderRouteName<A> = A extends [infer X]
  ? X
  : A extends [infer X, ...infer XS]
  ? X extends string
    ? XS extends string[]
      ? `${X}.${RenderRouteName<XS>}`
      : never
    : never
  : A extends string
  ? A
  : "";

export type RouteArrayOf<A> = A extends readonly (infer U)[]
  ? U extends { name: infer Name; children: infer Children }
    ? Children extends {}
      ? ToRouteArray<Name> | [...ToRouteArray<Name>, ...RouteArrayOf<Children>]
      : ToRouteArray<Name>
    : U extends { name: infer Name }
    ? ToRouteArray<Name>
    : []
  : [];

export type RouteNameOf<A> = RenderRouteName<RouteArrayOf<A>>;

export type ToRouteArray<A> = A extends string
  ? A extends `${infer X}.${infer XS}`
    ? [X, ...ToRouteArray<XS>]
    : [A]
  : [];

export type ToRouteNestedArray<A> = A extends string
  ? A extends `${infer X}.${infer XS}`
    ? [X, ToRouteArray<XS>]
    : [A]
  : [];

type AsParam<ParamName extends string> = { [P in ParamName]: string };
type AsOptParam<ParamName extends string> = { [P in ParamName]?: string };

/**
 * Parse a router5 path into its params
 *
 * See https://router5.js.org/guides/path-syntax
 */
export type ParseParams<A extends string> =
  // url params w/ regex
  A extends `:${infer Param}<${any}>/${infer Tail}`
    ? AsParam<Param> & ParseParams<Tail>
    : A extends `:${infer Param}<${any}>`
    ? AsParam<Param>
    : // plain url params
    A extends `:${infer Param}/${infer Tail}`
    ? AsParam<Param> & ParseParams<Tail>
    : A extends `:${infer Param}`
    ? AsParam<Param>
    : // matrix params w/ regex
    A extends `;${infer Param}<${any}>/${infer Tail}`
    ? AsOptParam<Param> & ParseParams<Tail>
    : A extends `;${infer Param}<${any}>`
    ? AsOptParam<Param>
    : // plain matrix params
    A extends `;${infer Param}/${infer Tail}`
    ? AsOptParam<Param> & ParseParams<Tail>
    : A extends `;${infer Param}`
    ? AsOptParam<Param>
    : // query parameters with leading colon
    A extends `${any}?:${infer Param}/${infer Tail}`
    ? AsOptParam<Param> & ParseParams<Tail>
    : A extends `${any}?:${infer Param}`
    ? AsOptParam<Param>
    : // query parameters without leading colon
    A extends `${any}?${infer Param}/${infer Tail}`
    ? AsOptParam<Param> & ParseParams<Tail>
    : A extends `${any}?${infer Param}`
    ? AsOptParam<Param>
    : // splat parameters (only supports it at the end of a path)
    A extends `*${infer Param}`
    ? { [P in Param]?: string[] }
    : // a path
    A extends `/${infer Tail}`
    ? ParseParams<Tail>
    : A extends `${any}/${infer Tail}`
    ? ParseParams<Tail>
    : {};

/**
 * Takes your `routes` and produces type metadata for consumption in this
 * library. The result is a union of [[RouteMeta]]s for each route.
 */
export type ReadRoutes<Tree extends RoutesLike<any>> = ReadRoutes__<
  Tree,
  [],
  []
>;

type ReadRoutes__<
  Tree,
  NameAcc extends string[],
  PathAcc extends string[]
> = Tree extends readonly (infer Node)[]
  ? Node extends {
      name: infer Name;
      path: infer Path;
      children?: infer Children;
    }
    ? Name extends string
      ? Path extends string
        ?
            | {
                name: Intercalate<[...NameAcc, Name], ".">;
                path: Concat<[...PathAcc, Path]>;
                params: ParseParams<Concat<[...PathAcc, Path]>>;
              }
            | ReadRoutes__<Children, [...NameAcc, Name], [...PathAcc, Path]>
        : never
      : never
    : never
  : never;

/**
 * The shape of the return type of [[ReadRoutes]]
 */
export interface RouteMeta {
  name: string;
  path: string;
  params: {};
}

export type OptionalNestedPathTo<Path, Dest> = Path extends [
  infer X,
  ...infer XS
]
  ? X extends string | number | symbol
    ? { [_ in X]?: OptionalNestedPathTo<XS, Dest> }
    : never
  : Dest;

export type ParamsMarker = {
  readonly "@@params": true;
};

export type Descend<Path, Tree> = Path extends [infer P1, ...infer PS]
  ? Tree extends readonly (infer Node)[]
    ? Node extends { name: infer Name; children?: infer Children }
      ? Name extends P1
        ? Descend<PS, Children>
        : never
      : never
    : never
  : Tree;

/****************
 * Utility types
 ****************/

type Str<A> = A extends string ? A : never;
type Strs<A> = A extends string[] ? A : never;

export type Concat<T extends string[]> = T extends [infer X, ...infer XS]
  ? `${Str<X>}${Concat<Strs<XS>>}`
  : "";

export type Intercalate<T extends string[], Sep extends string> = T extends [
  infer X
]
  ? X
  : T extends [infer X0, infer X1, ...infer XS]
  ? `${Str<X0>}${Sep}${Str<X1>}${Intercalate<Strs<XS>, Sep>}`
  : "";
