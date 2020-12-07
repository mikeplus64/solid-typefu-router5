import { createContext, useContext, createMemo } from "solid-js";
import { RouterContextValue, RouteLike } from "./types";
import { State as RouteState } from "router5";

const Context = createContext<RouterContextValue>();

export default Context;

export function useRoute(): () => RouteState {
  const ctx = useContext(Context);
  return () => ctx.state.route;
}

function paramsEq<
  A extends undefined | Record<string, any>,
  B extends undefined | Record<string, any>
>(a: A, b: B): boolean {
  if (a === b) return true;
  if (a === undefined) return b === undefined;
  if (b === undefined) return a === undefined;
  const keys = Object.keys(a!);
  for (const key of keys) if (!(key in b)) return false;
  for (const key of keys) if (String(a[key]) !== String(b[key])) return false;
  return keys.length === Object.keys(b!).length;
}

export function useIsActive<Link extends RouteLike>(
  link: Link,
  params?: Record<string, any>,
  paramsIsEqual: <A extends Record<string, any>, B extends Record<string, any>>(
    a: A,
    b: B
  ) => boolean = paramsEq
): () => boolean {
  const state = useContext(Context).state;
  const getIsActiveByName = createMemo(() => isActive(state.route.name, link));
  return createMemo(() =>
    getIsActiveByName() && params !== undefined
      ? paramsIsEqual(state.route.params, params)
      : true
  );
}

/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */
export function isActive<Link extends RouteLike>(here: string, link: Link) {
  return link.startsWith(here);
}
