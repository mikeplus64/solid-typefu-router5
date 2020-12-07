import { JSX } from "solid-js";
export declare type MatchRouteProps = PathProps & {
    children: JSX.Element;
};
export interface ExactPathProps {
    path: string;
    prefix?: undefined;
}
export interface PrefixPathProps {
    prefix: string;
    path?: undefined;
}
/**
 * ```ts
 * type PathProps = { path: string } | { prefix: string };
 * ```
 *
 * If [[ExactPathProps.path]] is given, then the match is exact, which means
 * that the current route name must be equal to `context.path + path` where
 * `context.path` means the current path created by other match components above
 * this one.
 *
 * If [[PrefixPathProps.prefix]] is given, then the match only requires that the
 * current route start with `context.path + prefix`.
 *
 */
export declare type PathProps = ExactPathProps | PrefixPathProps;
/**
 * Not reactive on the routes being used
 *
 * Prefer this over [[Switch]] + [[MatchRoute]]
 */
export declare function SwitchRoutes(props: {
    children: MatchRouteProps[];
    fallback?: JSX.Element;
}): JSX.Element;
export declare type ShowRouteProps = MatchRouteProps & {
    fallback?: JSX.Element;
};
/**
 * Create a [[Show]] node against a given route.
 */
export declare function ShowRoute(props: ShowRouteProps): JSX.Element;
/**
 * Create a [[Match]] node against a given route.
 */
export declare function MatchRoute(props: MatchRouteProps): JSX.Element;
//# sourceMappingURL=MatchRoute.d.ts.map