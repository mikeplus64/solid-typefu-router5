import { SharedRouterValue, RoutesLike } from "../types";
export declare enum LinkNav {
    Back = "back",
    Forward = "forward"
}
/** Props for making a `Link` component.
 *
 * @remarks
 *
 * Only some of the props are reactive; the rest are static at the time of
 * creating the link. The reactive props available are:
 *
 * - `to`
 * - `params`
 * - `disabled`
 * - `onClick`
 * - `innerProps`
 * - `disabledProps`
 */
export declare type LinkProps<Route> = {
    disabled?: boolean;
    nav?: boolean;
    navIgnoreParams?: boolean;
    onClick?: (ev: MouseEvent & {
        target: HTMLAnchorElement;
        currentTarget: HTMLAnchorElement;
    }) => void;
} & ({
    type: LinkNav.Back | LinkNav.Forward;
    to?: undefined;
    params?: undefined;
} | {
    type?: undefined;
    to: Route;
    params?: Record<string, any>;
}) & Omit<JSX.IntrinsicElements["a" | "button"], "onClick" | "href" | "type">;
export interface LinkConfig {
    navActiveClassName: string;
}
export declare type RouteLike = string | string[];
export declare function renderRouteLike(route: RouteLike): string;
export declare const defaultLinkConfig: LinkConfig;
export default function createLink<Deps, Routes extends RoutesLike<Deps>, RouteName extends RouteNameOf<Routes> & RouteLike>(self: SharedRouterValue<Deps, Routes>, config?: Partial<LinkConfig>): (props: LinkProps<RouteName>) => JSX.Element;
export declare type FlattenRouteName<A> = A extends [infer X] ? X : A extends [infer X, ...infer XS] ? X extends string ? XS extends string[] ? `${X}.${FlattenRouteName<XS>}` : never : never : A extends string ? A : "";
export declare type RouteNameOf<A> = FlattenRouteName<RouteArrayOf<A>>;
export declare type ToRouteArray<A> = A extends string ? A extends `${infer X}.${infer XS}` ? [X, ...ToRouteArray<XS>] : [A] : [];
export declare type RouteArrayOf<A> = A extends readonly (infer U)[] ? U extends {
    name: infer Name;
    children: infer Children;
} ? Children extends {} ? ToRouteArray<Name> | [...ToRouteArray<Name>, ...RouteArrayOf<Children>] : ToRouteArray<Name> : U extends {
    name: infer Name;
} ? ToRouteArray<Name> : [] : [];
export declare type UnOne<A> = A extends [infer U] ? U : A;
//# sourceMappingURL=Link.d.ts.map