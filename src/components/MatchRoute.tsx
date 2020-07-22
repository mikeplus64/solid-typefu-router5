import { createContext, useContext, Match, Show, createMemo } from "solid-js";
import { useRoute } from '../context';

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
  ({
    prefix: string,
    path?: undefined,
  } | {
    prefix?: undefined,
    path: string,
  }) & {
  children: JSX.Element,
};

/**
 * Match against a given route.
 *
 * @remarks
 * Not reactive with regards to the route being matched.
 */
export function MatchRoute(props: MatchRouteProps): JSX.Element {
  const route = useRoute();
  const ctx = useContext(MatchContext);

  const getMatch = createMemo<[string, boolean]>(() => {
    const suffix = props.path !== undefined ? props.path : props.prefix;
    const exact = props.path !== undefined;
    const target = ctx !== '' ? `${ctx}.${suffix}` : suffix;
    const here = route().name;
    console.log({ suffix, exact, target, here });
    return [
      target,
      exact ? here === target : here.startsWith(target),
    ];
  }, undefined, (a, b) => a && a[1] === b[1]);

  return () => {
    const [target, when] = getMatch();
    console.log({ target, when });
    return Match({
      when,
      children: () => MatchContext.Provider({
        value: target,
        children: () => {
          console.log('run matching for ', target);
          return props.children;
        },
      }),
    });
  };
}

export type ShowRouteProps =
  MatchRouteProps & { fallback?: JSX.Element };

export function ShowRoute(props: ShowRouteProps): JSX.Element {
  const route = useRoute();
  const ctx = useContext(MatchContext);
  const path = props.path !== undefined ? props.path : props.prefix;
  const exact = props.path !== undefined;
  const to = ctx !== '' ? `${ctx}.${path}` : path;
  return () => Show({
    when: exact ? route().name === to : route().name.startsWith(to),
    fallback: () => props.fallback,
    children: () => MatchContext.Provider({
      value: to,
      children: props.children,
    }),
  });
}
