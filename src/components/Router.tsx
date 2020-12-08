import { JSX, untrack } from "solid-js";
import { MatchRouteProps, SwitchRoutes } from "./Switch";
import { RouteLike, RouteMeta } from "../types";
import { useRoute } from "context";
import { Object } from "ts-toolbelt";

/**
 * Tells `solid-typefu-router5` how to render a node if the path leading to
 * it matches the current route name.
 */
export type RouterRenderNode<Params> = {
  /** Defaults to rendering the children. */
  render?: (props: { children?: JSX.Element; params: Params }) => JSX.Element;

  /** Fallback children to use if none are available to give to [[render]]. Default: nothing */
  fallback?: (props: { params: Params }) => JSX.Element;
};

export type RSM<RM extends RouteMeta[]> = _RSM<RM, {}>;

type _RSM<RM, Acc> = RM extends [infer R, ...infer RS]
  ? _RSM<
      RS,
      R extends { nameArray: infer Name; params: infer Params }
        ? Object.P.Record<
            Extract<Name, string[]>,
            RouterRenderNode<Params>,
            ["?", "W"]
          > &
            Acc
        : Acc
    >
  : Acc;

export type RenderNodeLike = RouterRenderNode<any>;
export type RouteNodeLike = { name: string; children?: RouteTreeLike };
export type RouteTreeLike = RouteNodeLike[];
export type RenderTreeLike = RenderNodeLike & { [k: string]: RenderTreeLike };

/**
 * Given a tree of routes and render instructions for each route, return an
 * element that selects the correct renderer for the current route.
 *
 * Also supports using routes to choose how to provide props to a single
 * renderer.
 */
export default function RouteStateMachine<
  T extends RenderTreeLike,
  A extends RouteLike
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
        children: traverse(next, child),
      });
    }
    return () => (
      <RenderHere params={route().params as any}>
        <SwitchRoutes
          fallback={() => <RenderFallback params={route().params as any} />}
          children={children}
        />
      </RenderHere>
    );
  }
  return untrack(() => traverse([], tree));
}

function nofallback() {
  return undefined;
}

function passthru(props: { children?: JSX.Element; params: any }): JSX.Element {
  return props.children;
}
