import { SharedRouterValue, RoutesLike } from '../types';
export declare enum LinkNav {
    Back = 0,
    Forward = 1
}
/** Props for making a `Link`
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
    onClick?: (ev: MouseEvent & {
        target: HTMLAnchorElement;
        currentTarget: HTMLAnchorElement;
    }) => void;
} & ({
    type: LinkNav.Back | LinkNav.Forward;
} | {
    type?: undefined;
    to: Route;
    params?: Record<string, any>;
}) & Omit<JSX.IntrinsicElements['a' | 'button'], 'onClick' | 'href' | 'type'>;
export interface LinkConfig {
    navActiveClassName: string;
}
export declare type RouteLike = string | string[];
export declare function renderRouteLike(route: RouteLike): string;
export declare const defaultLinkConfig: LinkConfig;
export default function createLink<Deps, Routes extends RoutesLike<Deps>, RouteName extends RouteNameOf<Routes> & RouteLike>(self: SharedRouterValue<Deps, Routes>, config?: Partial<LinkConfig>): (props: LinkProps<RouteName>) => JSX.Element;
export declare type RouteNameOf<A> = UnOne<Undefer<Flatten<TreeOf<A>, []>>>;
declare type TreeOf<A> = A extends readonly (infer U)[] ? U extends {
    name: infer Name;
    children: infer Children;
} ? Children extends {} ? [Name] | [Name, TreeOf<Children>] : Name : U extends {
    name: infer Name;
} ? [Name] : never : never;
declare type UnOne<A> = A extends [infer U] ? U : A;
declare type Flatten<Arg, Acc extends any[]> = Arg extends [infer X] ? [...Acc, X] : Arg extends [infer X, infer XS] ? Defer<Flatten<XS, [...Acc, X]>> : never;
interface Defer<X> {
    self: Undefer<X>;
}
declare type Undefer<X> = X extends {
    self: infer U;
} ? U : X;
export {};
//# sourceMappingURL=Link.d.ts.map