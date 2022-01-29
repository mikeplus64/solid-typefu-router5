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
): () => boolean {
  const route = useRoute();
  const getIsActiveByName = createMemo(() => isActive(route().name, link));
  return createMemo(
    () =>
      getIsActiveByName() &&
      (params === undefined || paramsIsEqual(route().params, params))
  );
}

/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */
export function isActive<Link extends RouteLike>(here: string, link: Link) {
  return link === here || here.startsWith(link + ".");
}
