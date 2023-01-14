import { JSX } from "solid-js";
import { O } from "ts-toolbelt";
import { IsActiveOptions } from "../context";
import { RouteMeta } from "../types";
/** See [[LinkOwnProps]] */
export declare type LinkProps<Route extends RouteMeta> = LinkOwnProps<Route> & LinkDisplayProps;
export declare type LinkDisplayProps = ({
    display: "button";
} & LinkIntrinsicProps<"button">) | ({
    display?: undefined;
} & LinkIntrinsicProps<"a">);
declare type LinkIntrinsicProps<Elem extends keyof JSX.IntrinsicElements> = Omit<JSX.IntrinsicElements[Elem], keyof LinkOwnProps<any>>;
/**
 * Props for making a `Link` component.
 *
 * @remarks
 *
 * You can set default values for any link props using the `defaultLinkProps`
 * option in the initial configuration.
 */
export declare type LinkOwnProps<Route extends RouteMeta> = {
    nav?: boolean;
    navActiveClass?: string;
    navIsActive?: IsActiveOptions;
    openInNewTab?: boolean;
    children?: JSX.Element;
    onClick?: JSX.EventHandler<HTMLElement, MouseEvent>;
    forward?: () => void;
    back?: () => void;
    disabled?: boolean;
} & LinkNav<Route>;
/**
 * Navigation type supported by links
 *
 * Extends router5 to support special '@@back' and '@@forward' routes, and makes
 * it optional to supply the 'params' object when there are no params to give,
 * or they are all optional
 */
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
export declare function Link<Route extends RouteMeta>(props: LinkProps<Route>): JSX.Element;
export {};
//# sourceMappingURL=Link.d.ts.map