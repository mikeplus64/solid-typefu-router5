import { RouterContextValue } from './types';
import { State as RouteState } from 'router5';
import { RouteLike } from 'components/Link';
declare const Context: import("solid-js/types/reactive/signal").Context<RouterContextValue>;
export default Context;
export declare function useRoute(): () => RouteState;
export declare function useRouteName(): () => readonly string[];
export declare function useRouteNameRaw(): () => string;
export declare function useIsActive<Link extends RouteLike>(link: Link, params?: Record<string, any>, isEqual?: <A extends Record<string, any>, B extends Record<string, any>>(a: A, b: B) => boolean): () => boolean;
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */
export declare function isActive<Link extends RouteLike>(here: readonly string[], link: Link): boolean;
//# sourceMappingURL=context.d.ts.map