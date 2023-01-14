import { RouterContextValue, RouteState, RouteLike } from "./types";
import { O, Any } from "ts-toolbelt";
import { Params } from "router5/dist/types/base";
declare const Context: import("solid-js").Context<RouterContextValue<any, any, any> | undefined>;
export default Context;
export declare function requireRouter(): RouterContextValue;
export declare function useRoute(): () => O.Readonly<RouteState, Any.Key, "deep">;
export interface IsActiveOptions {
    /** Whether to check if the given route is the active route, or a descendant
     * of the active route (false by default) */
    strictEquality?: boolean;
    /** Whether to ignore query params (true by default) */
    ignoreQueryParams?: boolean;
}
export declare function useIsActive<Link extends RouteLike>(getLink: () => {
    to: Link;
    params?: Params;
}, opts?: IsActiveOptions): () => boolean;
//# sourceMappingURL=context.d.ts.map