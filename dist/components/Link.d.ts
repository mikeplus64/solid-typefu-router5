import { RouteMeta } from "../types";
import { JSX } from "solid-js";
import { RequiredKeys } from "ts-essentials";
export declare type LinkNav<Route extends RouteMeta> = {
    to: "@@back" | "@@forward";
    params?: undefined;
} | (Route extends {
    name: infer Name;
    params: infer Params;
} ? {
    0: {
        to: Name;
        params: Params;
    };
    1: {
        to: Name;
        params?: Params;
    };
}[RequiresParams<Params>] : never);
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
export declare type LinkProps<Route extends RouteMeta> = {
    nav?: boolean;
    navActiveClass?: string;
    navIgnoreParams?: boolean;
    children?: JSX.Element;
    onClick?: (ev: MouseEvent & {
        target: HTMLElement;
        currentTarget: HTMLElement;
    }) => void;
    back?: () => void;
    forward?: () => void;
    display?: "button";
    disabled?: boolean;
} & LinkNav<Route> & Omit<JSX.IntrinsicElements["a" | "button"], "onClick" | "href" | "children">;
declare type RequiresParams<Params> = keyof Params extends never ? 1 : RequiredKeys<Params> extends never ? 1 : 0;
export interface LinkConfig {
    navActiveClass: string;
}
export default function Link<Route extends RouteMeta>(props: LinkProps<Route>): JSX.Element;
export {};
//# sourceMappingURL=Link.d.ts.map