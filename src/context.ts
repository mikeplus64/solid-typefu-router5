import { createContext, useContext } from 'solid-js';
import { RouterContextValue } from './types';
import { State as RouteState } from 'router5';

const Context = createContext<RouterContextValue>();

export default Context;

export function useRoute(): () => RouteState {
  return useContext(Context).getRoute;
}

export function useRouteName(): () => string[] {
  return useContext(Context).getRouteName;
}
