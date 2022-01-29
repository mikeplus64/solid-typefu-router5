import { useRoute } from "context";
import { JSX, untrack } from "solid-js";
import { Any, Object, Union, String } from "ts-toolbelt";
import { RouteMeta, RouterRenderNode, RenderTreeLike } from "../types";
import { MatchRouteProps, SwitchRoutes } from "./Switch";

export type RSM<
  RM extends [...RouteMeta[]],
  Path extends string[] | string | undefined = undefined
> = Path extends string
  ? Object.Path<_RSM0<RM>, String.Split<Path, ".">>
  : Path extends string[]
  ? Object.Path<_RSM0<RM>, Path>
  : _RSM0<RM>;

type _RSM0<RM extends [...RouteMeta[]]> = _RSM<RM> & RouterRenderNode<{}>;

type _RSM<RM extends [...RouteMeta[]]> = Any.Compute<
  Union.IntersectOf<
    {
      [K in keyof RM]: Object.P.Record<
        Extract<RM[K], RouteMeta>["nameArray"],
        RouterRenderNode<Extract<RM[K], RouteMeta>["params"]>,
        ["?", "W"]
      >;
    }[number]
  >
>;

/**
 * Given a tree of routes and render instructions for each route, return an
 * element that selects the correct renderer for the current route.
 *
 * Also supports using routes to choose how to provide props to a single
 * renderer.
 */
export default function RouteStateMachine<
  T extends RenderTreeLike,
  A extends string | string[]
>(tree: T, _assumed?: A): JSX.Element {
  const route = useRoute();
  function traverse(path: string[], node: RenderTreeLike): JSX.Element {
    const children: MatchRouteProps[] = [];
    const {
      render: RenderHere = passthru,
      fallback: RenderFallback = nofallback,
      ...routes
    } = node;
    for (const key in routes) {
      const next = [...path, key];
      const child = routes[key]!;
      children.push({
        prefix: key,
        children: () => traverse(next, child),
      });
    }
    return untrack(() => (
      <RenderHere params={route().params as any}>
        <SwitchRoutes
          fallback={() => <RenderFallback params={route().params as any} />}
          children={children}
        />
      </RenderHere>
    ));
  }
  return untrack(() => traverse([], tree));
}

function nofallback() {
  return undefined;
}

function passthru(props: { children?: JSX.Element; params: any }): JSX.Element {
  return props.children;
}
