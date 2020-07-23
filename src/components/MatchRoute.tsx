import { createContext, useContext, Match, Show, createMemo } from "solid-js";
import { useRouteNameRaw } from '../context';

const MatchContext = createContext<string>('');

/**
 * If `path` is given, then the match is exact, which means that the current
 * route name must be equal to `context.path + path` where `context.path` means
 * the current path created by other match components above this one.
 *
 * If `prefix` is given, then the match only requires that the current route
 * start with `context.path + prefix`.
 */
export type MatchRouteProps =
  PathProps & { children: JSX.Element };

export type PathProps =
  {
    prefix: string,
    path?: undefined,
  } | {
    prefix?: undefined,
    path: string,
  };

function doesMatch(ctx: string, here: string, props: PathProps): [string, boolean] {
  const suffix = props.path !== undefined ? props.path : props.prefix;
  const exact = props.path !== undefined;
  const target = ctx !== '' ? `${ctx}.${suffix}` : suffix;
  return [
    target,
    exact ? here === target : here.startsWith(target),
  ];
}

function createGetMatch(props: PathProps): () => [string, boolean] {
  const route = useRouteNameRaw();
  const ctx = useContext(MatchContext);
  return createMemo<[string, boolean]>(
    () => doesMatch(ctx, route(), props),
    undefined,
    (a, b) => a && a[1] === b[1],
  );
}

/**
 * Match against a given route.
 *
 * @remarks
 * Not reactive with regards to the route being matched.
 */
export function MatchRoute(props: MatchRouteProps): JSX.Element {
  const getMatch = createGetMatch(props);
  return (
    <Match when={getMatch()[1]}>
      <MatchContext.Provider value={getMatch()[0]}>
        {props.children}
      </MatchContext.Provider>
    </Match>);
}

/**
 * Not reactive on the routes being used
 */
export function SwitchRoutes(props: {
  children: MatchRouteProps[]
  fallback?: JSX.Element,
}): JSX.Element {
  const ctx = useContext(MatchContext);
  const route = useRouteNameRaw();
  const getIndex = createMemo<undefined | [number, string]>(() => {
    const here = route();
    const children = props.children;
    for (let i = 0; i < children.length; i ++) {
      const [target, when] = doesMatch(ctx, here, children[i]);
      if (when) return [i, target];
    }
    return undefined;
  }, undefined, (a, b) => a === b || a !== undefined && b !== undefined && a[0] === b[0]);

  return () => {
    const ix = getIndex();
    if (ix !== undefined) {
      const [i, target] = ix;
      return (
        <MatchContext.Provider value={target}>
          {props.children[i].children}
        </MatchContext.Provider>);
    }
    return props.fallback;
  };
}

export type ShowRouteProps =
  MatchRouteProps & { fallback?: JSX.Element };

export function ShowRoute(props: ShowRouteProps): JSX.Element {
  const getMatch = createGetMatch(props);
  return () => {
    const [target, when] = getMatch();
    return (
      <Show when={when} fallback={props.fallback}>
        <MatchContext.Provider value={target}>
          {props.children}
        </MatchContext.Provider>
      </Show>);
  };
}
