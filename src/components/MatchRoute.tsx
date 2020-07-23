import { createContext, useContext, Show, createMemo } from "solid-js";
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

function createGetMatch(props: PathProps): () => [string, boolean] {
  const route = useRouteNameRaw();
  const ctx = useContext(MatchContext);
  const getMatch = createMemo<[string, boolean]>(() => {
    const suffix = props.path !== undefined ? props.path : props.prefix;
    const exact = props.path !== undefined;
    const target = ctx !== '' ? `${ctx}.${suffix}` : suffix;
    const here = route();
    return [
      target,
      exact ? here === target : here.startsWith(target),
    ];
  }, undefined, (a, b) => a && a[0] === b[0] && a[1] === b[1]);
  return getMatch;
}

/**
 * Match against a given route.
 *
 * @remarks
 * Not reactive with regards to the route being matched.
 */
export function MatchRoute(props: MatchRouteProps): JSX.Element {
  const getMatch = createGetMatch(props);
  return () => {
    const [value, when] = getMatch();
    console.log({ value, when });
    return !when ? undefined :
      <MatchContext.Provider value={value}>
        {props.children}
      </MatchContext.Provider>;
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
