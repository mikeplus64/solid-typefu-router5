import { createContext, useContext } from 'solid-js';
import { RouterContextValue } from './types';
import { State as RouteState } from 'router5';
import { RouteLike } from 'components/Link';

const Context = createContext<RouterContextValue>();

export default Context;

export function useRoute(): () => RouteState {
  return useContext(Context).getRoute;
}

export function useRouteName(): () => string[] {
  return useContext(Context).getRouteName;
}

export function useRouteNameRaw(): () => string {
  return useContext(Context).getRouteNameRaw;
}

export function useActive<Link extends RouteLike>(link: Link): () => boolean {
  const getRouteName = useRouteName();
  return () => isActive(getRouteName(), link);
}

/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 */
export function isActive<Route extends RouteLike>(here: string[], link: Route) {
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
