import { createContext, useContext, createMemo } from "solid-js";
import { RouterContextValue, RouteState, RouteLike } from "./types";
import { O, Any } from "ts-toolbelt";

const Context = createContext<RouterContextValue>();

export default Context;

export function requireRouter(): RouterContextValue {
  const ctx = useContext(Context);
  if (ctx === undefined) {
    throw Error("solid-typefu-router5: No router context available");
  }
  return ctx;
}

export function useRoute(): () => O.Readonly<RouteState, Any.Key, "deep"> {
  const ctx = requireRouter();
  return () => ctx.state.route;
}

export function paramsEq(
  current: undefined | Record<string, any>,
  target: undefined | Record<string, any>
): boolean {
  if (current === target) return true;
  if (current === undefined) return target === undefined;
  if (target === undefined) return current === undefined;
  for (const key of Object.keys(target)) {
    if (!(key in current) || current[key] !== target[key]) return false;
  }
  return true;
}

export function paramsNeverEq() {
  return false;
}

export function useIsActive<Link extends RouteLike>(
  getLink: () => { to: Link; params?: Record<string, any> },
  paramsIsEqual: (
    a: undefined | Record<string, any>,
    b: undefined | Record<string, any>
  ) => boolean = paramsEq
): () => RouteActive {
  const getRoute = useRoute();
  return createMemo(() => {
    const link = getLink();
    const route = getRoute();
    const active = isActive(route.name, link.to);
    if (active > 0) {
      if (paramsIsEqual(route.params, link.params)) {
        return active | RouteActive.EqualParams;
      }
    }
    return active;
  });
}

export enum RouteActive {
  Inactive = 0,
  ActiveRoutePrefix = 0b001,
  ActiveRouteExact = 0b010,
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
