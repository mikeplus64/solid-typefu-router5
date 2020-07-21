import { createContext, useContext } from 'solid-js';
import { RouterContextValue } from './types';
import { State as RouteState } from 'router5';
import { RouteLike, isActive } from 'components/Link';

const Context = createContext<RouterContextValue>();

export default Context;

export function useRoute(): () => RouteState {
  return useContext(Context).getRoute;
}

export function useRouteName(): () => string[] {
  return useContext(Context).getRouteName;
}

export function useActive<Link extends RouteLike>(link: Link): () => boolean {
  const getRouteName = useRouteName();
  return () => isActive(getRouteName(), link);
}
