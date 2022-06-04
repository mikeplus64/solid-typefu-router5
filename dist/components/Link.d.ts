import { RouteMeta } from "../types";
import { RouteActive } from "../context";
import { JSX } from "solid-js";
import { O } from "ts-toolbelt";
export declare type LinkNav<Route extends RouteMeta> = {
    to: "@@back" | "@@forward";
    params?: undefined;
} | (Route extends {
    name: infer Name;
    params: infer Params;
} ? {
    0: {
        to: Name;
        params?: Params;
    };
    1: {
        to: Name;
        params: Params;
    };
}[RequiresParams<Params>] : never);
declare type RequiresParams<Params> = keyof Params extends never ? 0 : O.RequiredKeys<Extract<Params, object>> extends never ? 0 : 1;
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
 * - `disabledProps`
 */
export declare type LinkProps<Route extends RouteMeta> = O.Merge<Omit<JSX.IntrinsicElements["a"], "onClick">, {
    nav?: boolean;
    navIgnoreParams?: boolean;
    navActiveClassList?: (state: RouteActive) => Record<string, boolean>;
    openInNewTab?: boolean;
    children?: JSX.Element;
    onClick?: (ev: MouseEvent & {
        target: HTMLElement;
        currentTarget: HTMLElement;
    }) => void;
    back?: () => void;
    forward?: () => void;
    display?: "button";
    disabled?: boolean;
} & LinkNav<Route>>;
export declare function Link<Route extends RouteMeta>(props: LinkProps<Route>): JSX.Element;
export declare function createLink<Route extends RouteMeta>(defaultProps: LinkProps<Route>): (props: LinkProps<Route>) => JSX.Element;
export {};
//# sourceMappingURL=Link.d.ts.map