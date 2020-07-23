/**
 * If `path` is given, then the match is exact, which means that the current
 * route name must be equal to `context.path + path` where `context.path` means
 * the current path created by other match components above this one.
 *
 * If `prefix` is given, then the match only requires that the current route
 * start with `context.path + prefix`.
 */
export declare type MatchRouteProps = PathProps & {
    children: JSX.Element;
};
export declare type PathProps = {
    prefix: string;
    path?: undefined;
} | {
    prefix?: undefined;
    path: string;
};
/**
 * Match against a given route.
 *
 * @remarks
 * Not reactive with regards to the route being matched.
 */
export declare function MatchRoute(props: MatchRouteProps): JSX.Element;
/**
 * Not reactive on the routes being used
 */
export declare function SwitchRoutes(props: {
    children: MatchRouteProps[];
    fallback?: JSX.Element;
}): JSX.Element;
export declare type ShowRouteProps = MatchRouteProps & {
    fallback?: JSX.Element;
};
export declare function ShowRoute(props: ShowRouteProps): JSX.Element;
//# sourceMappingURL=MatchRoute.d.ts.map