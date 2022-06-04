import { createContext, useContext, createMemo } from "solid-js";
import { DeepReadonly } from "solid-js/store";
import { RouterContextValue, RouteState, RouteLike } from "./types";

const Context = createContext<RouterContextValue>();

export default Context;

export function requireRouter(): RouterContextValue {
  const ctx = useContext(Context);
  if (ctx === undefined) {
    throw Error("solid-typefu-router5: No router context available");
  }
  return ctx;
}

export function useRoute(): () => DeepReadonly<RouteState> {
  const ctx = requireRouter();
  return () => ctx.state.route;
}

function paramsEq(
  a: undefined | Record<string, any>,
  b: undefined | Record<string, any>
): boolean {
  if (a === b) return true;
  if (a === undefined) return b === undefined;
  if (b === undefined) return a === undefined;
  const keysA = Object.keys(a!);
  for (const key of keysA) if (!(key in b)) return false;
  for (const key of keysA) if (String(a[key]) !== String(b[key])) return false;
  return keysA.length === Object.keys(b!).length;
}

export function useIsActive<Link extends RouteLike>(
  link: Link,
  params?: Record<string, any>,
  paramsIsEqual: (
    a: undefined | Record<string, any>,
    b: undefined | Record<string, any>
  ) => boolean = paramsEq
): () => RouteActive {
  const route = useRoute();
  const getIsActiveByName = createMemo(() => isActive(route().name, link));
  return createMemo(() => {
    const active = getIsActiveByName();
    if (active !== RouteActive.Inactive) {
      const paramsEq =
        params === undefined || paramsIsEqual(route().params, params)
          ? RouteActive.EqualParams
          : RouteActive.Inactive;
      return active | paramsEq;
    }
    return RouteActive.Inactive;
  });
}

export enum RouteActive {
  Inactive = 0,
  ActiveRoutePrefix = 0b001,
  ActiveRouteExact = 0b011,
  EqualParams = 0b100,
}

/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */
export function isActive<Link extends RouteLike>(
  here: string,
  link: Link
): RouteActive {
  if (link === here) return RouteActive.ActiveRouteExact;
  if (here.startsWith(link + ".")) return RouteActive.ActiveRoutePrefix;
  return RouteActive.Inactive;
}
