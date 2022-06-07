import { RouterContextValue, RouteState, RouteLike } from "./types";
import { O, Any } from "ts-toolbelt";
declare const Context: import("solid-js").Context<RouterContextValue<any, any, any> | undefined>;
export default Context;
export declare function requireRouter(): RouterContextValue;
export declare function useRoute(): () => O.Readonly<RouteState, Any.Key, "deep">;
export declare function paramsEq(current: undefined | Record<string, any>, target: undefined | Record<string, any>): boolean;
export declare function paramsNeverEq(): boolean;
export declare function useIsActive<Link extends RouteLike>(getLink: () => {
    to: Link;
    params?: Record<string, any>;
}, paramsIsEqual?: (a: undefined | Record<string, any>, b: undefined | Record<string, any>) => boolean): () => RouteActive;
export declare enum RouteActive {
    Inactive = 0,
    ActiveRoutePrefix = 1,
    ActiveRouteExact = 2,
    EqualParams = 4
}
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */
export declare function isActive<Link extends RouteLike>(here: string, link: Link): RouteActive;
//# sourceMappingURL=context.d.ts.map