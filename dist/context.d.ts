import { RouterContextValue } from './types';
import { State as RouteState } from 'router5';
declare const Context: import("solid-js/types/reactive/signal").Context<RouterContextValue>;
export default Context;
export declare function useRoute(): () => RouteState;
export declare function useRouteName(): () => string[];
//# sourceMappingURL=context.d.ts.map