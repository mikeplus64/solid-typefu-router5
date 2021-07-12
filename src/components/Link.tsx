import { RouteMeta } from "../types";
import { requireRouter, useIsActive } from "../context";
import { JSX, createMemo, splitProps, mergeProps } from "solid-js";
import { Object } from "ts-toolbelt";

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
  : Object.RequiredKeys<Extract<Params, object>> extends never
  ? 0
  : 1;

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
export type LinkProps<Route extends RouteMeta> = {
  nav?: boolean;
  navActiveClass?: string;
  navIgnoreParams?: boolean;
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
} & LinkNav<Route> &
  Omit<JSX.IntrinsicElements["a" | "button"], "onClick" | "href" | "children">;

export interface LinkConfig {
  navActiveClass: string;
}

export default function Link<Route extends RouteMeta>(
  props: LinkProps<Route>
): JSX.Element {
  const { router: router5, config } = requireRouter();

  let [linkProps, innerProps] = splitProps(props, [
    "type",
    "onClick",
    "classList",
    "to",
    "params",
    "nav",
    "navIgnoreParams",
    "navActiveClass",
    "disabled",
    "back",
    "forward",
    "display",
  ]);

  linkProps = mergeProps(
    {
      navActiveClass: config.navActiveClass,
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
    const cls: Record<string, any> = { ...linkProps.classList };
    if (linkProps.nav && typeof linkProps.navActiveClass === "string") {
      cls[linkProps.navActiveClass] = isActive();
    }
    return cls;
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
        onClick={onClick}
      />
    )
  );
}

const alwaysInactive = () => false;
