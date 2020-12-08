import { RouteMeta } from "../types";
import Context, { useIsActive } from "../context";
import { JSX, assignProps, createMemo, splitProps, useContext } from "solid-js";
import { RequiredKeys } from "ts-essentials";

export type LinkNav<Route extends RouteMeta> =
  | { to: "@@back" | "@@forward"; params?: undefined }
  | (Route extends { name: infer Name; params: infer Params }
      ? RequiresParams<Params> extends true
        ? { to: Name; params: Params }
        : { to: Name; params?: Params | undefined }
      : never);

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

type RequiresParams<Params> = keyof Params extends never
  ? false
  : RequiredKeys<Params> extends never
  ? false
  : true;

export interface LinkConfig {
  navActiveClass: string;
}

export default function Link<Route extends RouteMeta>(
  props: LinkProps<Route>
): JSX.Element {
  const { router: router5, config } = useContext(Context);

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

  linkProps = assignProps(
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
    if (typeof linkProps.navActiveClass === "string") {
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

  return () =>
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
    );
}

const alwaysInactive = () => false;
