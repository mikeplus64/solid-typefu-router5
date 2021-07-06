import { RouterContextValue, RouteState, RouteLike } from "./types";
declare const Context: import("solid-js").Context<RouterContextValue<any, any> | undefined>;
export default Context;
export declare function requireRouter(): RouterContextValue;
export declare function useRoute(): () => RouteState;
export declare function useIsActive<Link extends RouteLike>(link: Link, params?: Record<string, any>, paramsIsEqual?: (a: undefined | Record<string, any>, b: undefined | Record<string, any>) => boolean): () => boolean;
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */
export declare function isActive<Link extends RouteLike>(here: string, link: Link): boolean;
//# sourceMappingURL=context.d.ts.map