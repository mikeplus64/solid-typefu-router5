import { RouterContextValue } from './types';
import { State as RouteState } from 'router5';
import { RouteLike } from 'components/Link';
declare const Context: import("solid-js/types/reactive/signal").Context<RouterContextValue>;
export default Context;
export declare function useRoute(): () => RouteState;
export declare function useRouteName(): () => string[];
export declare function useRouteNameRaw(): () => string;
export declare function useActive<Link extends RouteLike>(link: Link): () => boolean;
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 */
export declare function isActive<Route extends RouteLike>(here: string[], link: Route): boolean;
//# sourceMappingURL=context.d.ts.map