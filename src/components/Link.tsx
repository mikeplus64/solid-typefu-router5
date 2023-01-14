import { createMemo, JSX, mergeProps, splitProps, untrack } from "solid-js";
import { O } from "ts-toolbelt";
import { IsActiveOptions, requireRouter, useIsActive } from "../context";
import { RouteMeta } from "../types";

/** See [[LinkOwnProps]] */
export type LinkProps<Route extends RouteMeta> = LinkOwnProps<Route> &
  LinkDisplayProps;

export type LinkDisplayProps =
  | ({ display: "button" } & LinkIntrinsicProps<"button">)
  | ({ display?: undefined } & LinkIntrinsicProps<"a">);

type LinkIntrinsicProps<Elem extends keyof JSX.IntrinsicElements> = Omit<
  JSX.IntrinsicElements[Elem],
  keyof LinkOwnProps<any>
>;

/**
 * Props for making a `Link` component.
 *
 * @remarks
 *
 * You can set default values for any link props using the `defaultLinkProps`
 * option in the initial configuration.
 */
export type LinkOwnProps<Route extends RouteMeta> = {
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
export type LinkNav<Route extends RouteMeta> =
  | { to: "@@back" | "@@forward"; params?: undefined }
  | (Route extends { name: infer Name; params: infer Params }
      ? {
          0: { to: Name; params?: Params };
          1: { to: Name; params: Params };
        }[RequiresParams<Params>]
      : never);

type RequiresParams<Params> = keyof Params extends never
  ? 0
  : O.RequiredKeys<Extract<Params, object>> extends never
  ? 0
  : 1;

export function Link<Route extends RouteMeta>(
  props: LinkProps<Route>
): JSX.Element {
  const { router: router5, config } = requireRouter();

  let [linkProps, innerProps] = splitProps(props as SimpleLinkProps<Route>, [
    "type",
    "onClick",
    "classList",
    "to",
    "params",
    "nav",
    "navIsActive",
    "navActiveClass",
    "disabled",
    "back",
    "forward",
    "display",
    "openInNewTab",
  ]);

  linkProps = mergeProps(
    config.defaultLinkProps ?? defaultLinkProps,
    {
      back: config.back,
      forward: config.forward,
    },
    linkProps
  ) as any;

  const getHref = createMemo(() => {
    const { to, params } = linkProps;
    if (typeof to === "string" && !to.startsWith("@@")) {
      try {
        return router5.buildPath(to, params);
      } catch (err) {
        console.warn("<Link> buildPath failed:", err);
      }
    }
    return undefined;
  });

  //
  // micro-opt: if we dont have a 'nav' prop then dont make memos for isActive
  // and getClassList at all
  //

  const haveNavProp = untrack(() => "nav" in linkProps);

  const isActive = !haveNavProp
    ? alwaysInactive
    : createMemo(() => {
        const { to, nav, navIsActive } = linkProps;
        if (!nav || typeof to !== "string") return alwaysInactive;
        return useIsActive(() => props, navIsActive);
      });

  const getClassList = !haveNavProp
    ? () => linkProps.classList
    : createMemo(() => {
        const { navActiveClass, classList } = linkProps;
        if (typeof navActiveClass === "string") {
          return mergeProps({ [navActiveClass]: isActive() }, classList);
        }
        return classList;
      });

  function onClick(
    ev: MouseEvent & { target: HTMLElement; currentTarget: HTMLElement }
  ) {
    ev.preventDefault();
    switch (linkProps.to) {
      case "@@forward":
        linkProps.forward?.();
        break;
      case "@@back":
        linkProps.back?.();
        break;
      default:
        router5.navigate(linkProps.to!, linkProps.params ?? {});
        linkProps.onClick?.(ev);
        break;
    }
    ev.target.blur();
  }

  return createMemo(() =>
    linkProps.display === "button" ? (
      <button
        {...(innerProps as any)}
        disabled={linkProps.disabled}
        classList={getClassList()}
        onClick={onClick}
      />
    ) : linkProps.to.startsWith("@@") ? (
      <button
        {...(innerProps as any)}
        classList={getClassList()}
        onClick={onClick}
      />
    ) : (
      <a
        {...(innerProps as any)}
        classList={getClassList()}
        href={getHref()}
        target={linkProps.openInNewTab ? "_blank" : undefined}
        rel={linkProps.openInNewTab ? "noopener noreferrer" : undefined}
        onClick={linkProps.openInNewTab ? undefined : onClick}
      />
    )
  );
}

const defaultLinkProps: Partial<LinkProps<any>> = {
  navActiveClass: "is-active",
  navIsActive: {
    ignoreQueryParams: true,
    strictEquality: false,
  },
};

const alwaysInactive = () => false;

type SimpleLinkProps<Route extends RouteMeta> = LinkOwnProps<Route> & {
  display?: "button";
} & LinkIntrinsicProps<"button" | "a">;
