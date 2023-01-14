import { createContext, useContext, createMemo } from "solid-js";
import { RouterContextValue, RouteState, RouteLike } from "./types";
import { O, Any } from "ts-toolbelt";
import { Params } from "router5/dist/types/base";

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

export interface IsActiveOptions {
  /** Whether to check if the given route is the active route, or a descendant
   * of the active route (false by default) */
  strictEquality?: boolean;
  /** Whether to ignore query params (true by default) */
  ignoreQueryParams?: boolean;
}

export function useIsActive<Link extends RouteLike>(
  getLink: () => { to: Link; params?: Params },
  opts?: IsActiveOptions
): () => boolean {
  const ctx = requireRouter();
  return createMemo(() => {
    const { to, params } = getLink();
    return ctx.router.isActive(
      to,
      params,
      opts?.strictEquality,
      opts?.ignoreQueryParams
    );
  });
}
