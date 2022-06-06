import { RouteMeta } from "../types";
import { requireRouter, RouteActive, useIsActive } from "../context";
import { JSX, createMemo, splitProps, mergeProps } from "solid-js";
import { O } from "ts-toolbelt";

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

/**
 * Props for making a `Link` component.
 *
 * @remarks
 *
 * You can set default values for any link props using the `defaultLinkProps`
 * option in the initial configuration.
 */
export type LinkProps<Route extends RouteMeta> = O.Merge<
  Omit<JSX.IntrinsicElements["a"], "onClick">,
  {
    nav?: boolean;
    navIgnoreParams?: boolean;
    navActiveClassList?: (state: RouteActive) => Record<string, boolean>;
    openInNewTab?: boolean;
    children?: JSX.Element;
    onClick?: (
      ev: MouseEvent & {
        target: HTMLElement;
        currentTarget: HTMLElement;
      }
    ) => void;
    back?: () => void;
    forward?: () => void;
    display?: "button";
    disabled?: boolean;
  } & LinkNav<Route>
>;

const defaultLinkProps = {
  navActiveClassList: (state: RouteActive): Record<string, boolean> => ({
    "is-active": state > 0,
    "is-active-prefix":
      (state & RouteActive.ActiveRoutePrefix) === RouteActive.ActiveRoutePrefix,
    "is-active-exact":
      (state & RouteActive.ActiveRouteExact) === RouteActive.ActiveRouteExact,
  }),
};

export function Link<Route extends RouteMeta>(
  props: LinkProps<Route>
): JSX.Element {
  const { router: router5, config } = requireRouter();

  let [linkProps, innerProps] = splitProps(props, [
    "type",
    "onClick",
    "classList",
    "to",
    "params",
    "navIgnoreParams",
    "navActiveClassList",
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

  const isActive =
    typeof linkProps.to === "string"
      ? useIsActive(
          linkProps.to,
          linkProps.navIgnoreParams ? undefined : linkProps.params
        )
      : alwaysInactive;

  const getHref: () => string | undefined = createMemo(() => {
    if (typeof linkProps.to === "string" && !linkProps.to.startsWith("@@")) {
      try {
        return router5.buildPath(linkProps.to, linkProps.params);
      } catch (err) {
        console.warn("<Link> buildPath failed:", err);
      }
    }
    return undefined;
  });

  const getClassList = createMemo(() => {
    if (linkProps.navActiveClassList !== undefined) {
      return mergeProps(
        linkProps.navActiveClassList(isActive()),
        linkProps.classList
      );
    }
    return mergeProps(linkProps.classList);
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
        if (typeof linkProps.onClick === "function") linkProps.onClick(ev);
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

const alwaysInactive = () => RouteActive.Inactive;
