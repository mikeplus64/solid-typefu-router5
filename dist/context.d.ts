import { RouterContextValue, RouteState, RouteLike } from "./types";
declare const Context: import("solid-js/types/reactive/signal").Context<RouterContextValue<any, any>>;
export default Context;
export declare function useRoute(): () => RouteState;
export declare function useIsActive<Link extends RouteLike>(link: Link, params?: Record<string, any>, paramsIsEqual?: <A extends Record<string, any>, B extends Record<string, any>>(a: A, b: B) => boolean): () => boolean;
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */
export declare function isActive<Link extends RouteLike>(here: string, link: Link): boolean;
//# sourceMappingURL=context.d.ts.map