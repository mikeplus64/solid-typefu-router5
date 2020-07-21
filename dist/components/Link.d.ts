import { RouteNode } from 'router5';
import { SharedRouterValue } from '../types';
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
    innerProps?: Omit<JSX.IntrinsicElements['a' | 'button'], 'onClick' | 'href'>;
} & ({
    type: LinkNav.Back | LinkNav.Forward;
} | {
    type: undefined;
    to: Route;
    params?: Record<string, any>;
});
export interface LinkConfig {
    navActiveClassName: string;
}
export declare type RouteLike = string | string[];
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 */
export declare function isActive<Route extends RouteLike>(here: string[], link: Route): boolean;
export declare function renderRouteLike(route: RouteLike): string;
export declare const defaultLinkConfig: LinkConfig;
export default function createLink<Deps, Routes extends readonly RouteNode[], RouteName extends RouteNameOf<Routes> & RouteLike>(self: SharedRouterValue<Deps, Routes>, config?: Partial<LinkConfig>): (props: LinkProps<RouteName>) => JSX.Element;
export declare type RouteNameOf<A> = UnOne<Exp<TreeOf<A>>>;
declare type TreeOf<A> = A extends readonly (infer U)[] ? U extends {
    name: infer Name;
    children: infer Children;
} ? Children extends {} ? [Name] | [Name, TreeOf<Children>] : Name : U extends {
    name: infer Name;
} ? [Name] : never : never;
declare type UnOne<A> = A extends [infer U] ? U : A;
declare type Exp<Arg> = Arg extends [infer X] ? [X] : Arg extends [infer X, infer XS] ? [X, ...Exp1<XS>] : never;
declare type Exp1<Arg> = Arg extends [infer X] ? [X] : Arg extends [infer X, infer XS] ? [X, ...Exp2<XS>] : never;
declare type Exp2<Arg> = Arg extends [infer X] ? [X] : Arg extends [infer X, infer XS] ? [X, ...Exp3<XS>] : never;
declare type Exp3<Arg> = Arg extends [infer X] ? [X] : Arg extends [infer X, infer XS] ? [X, ...Exp4<XS>] : never;
declare type Exp4<Arg> = Arg extends [infer X] ? [X] : Arg extends [infer X, infer XS] ? [X, ...Exp5<XS>] : never;
declare type Exp5<Arg> = Arg extends [infer X] ? [X] : Arg extends [infer X, infer XS] ? [X, ...Exp6<XS>] : never;
declare type Exp6<Arg> = Arg extends [infer X] ? [X] : Arg extends [infer X, any] ? [X, ...never] : never;
export {};
//# sourceMappingURL=Link.d.ts.map