import { createContext, useContext, createMemo } from 'solid-js';
import { RouterContextValue } from './types';
import { State as RouteState } from 'router5';
import { RouteLike } from 'components/Link';

const Context = createContext<RouterContextValue>();

export default Context;

export function useRoute(): () => RouteState {
  return useContext(Context).getRoute;
}

export function useRouteName(): () => readonly string[] {
  return useContext(Context).getRouteName;
}

export function useRouteNameRaw(): () => string {
  return useContext(Context).getRouteNameRaw;
}

function shallowStringyEq<
  A extends Record<string, any>,
  B extends Record<string, any>
>(a: A, b: B): boolean {
  if (a === b) return true;
  const keys = Object.keys(a);
  for (const key of keys) if (!(key in b)) return false;
  for (const key of keys) if (String(a[key]) !== String(b[key])) return false;
  return keys.length === Object.keys(b).length;
}

export function useIsActive<Link extends RouteLike>(
  link: Link,
  params?: Record<string, any>,
  isEqual: <A extends Record<string, any>, B extends Record<string, any>>(a: A, b: B) => boolean = shallowStringyEq,
): () => boolean {
  const getRouteName = useRouteName();
  const getIsActiveByName = createMemo(() => isActive(getRouteName(), link));
  if (params === undefined) return getIsActiveByName;
  const getRoute = useRoute();
  const getRouteParams = createMemo(() => getRoute().params);
  return createMemo(() => {
    const routeParams = getRouteParams();
    return getIsActiveByName() && isEqual(routeParams, params);
  });
}

/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */
export function isActive<Link extends RouteLike>(here: readonly string[], link: Link) {
  if (here.length === 0) { return false; }
  if (typeof link === 'string') { return here[0] === link; }
  // if link has more segments than here then it definitely cannot be an
  // ancestor of here
  if (link.length > here.length) return false;
  for (let i = 0; i < link.length; i ++) {
    if (link[i] !== here[i]) return false;
  }
  return true;
}
