import { SharedRouterValue, RoutesLike } from "../types";
import { useIsActive } from "../context";
import { createMemo, splitProps } from "solid-js";

export enum LinkNav {
  Back = "back",
  Forward = "forward",
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
export type LinkProps<Route> = {
  disabled?: boolean;
  nav?: boolean;
  navIgnoreParams?: boolean;
  onClick?: (
    ev: MouseEvent & {
      target: HTMLAnchorElement;
      currentTarget: HTMLAnchorElement;
    }
  ) => void;
} & (
  | {
      type: LinkNav.Back | LinkNav.Forward;
      to?: undefined;
      params?: undefined;
    }
  | {
      type?: undefined;
      to: Route;
      params?: Record<string, any>;
    }
) &
  Omit<JSX.IntrinsicElements["a" | "button"], "onClick" | "href" | "type">;

export interface LinkConfig {
  navActiveClassName: string;
}

export type RouteLike = string | string[];

export function renderRouteLike(route: RouteLike) {
  if (typeof route === "string") return route;
  return route.join(".");
}

export const defaultLinkConfig: LinkConfig = {
  navActiveClassName: "is-active",
};

export default function createLink<
  Deps,
  Routes extends RoutesLike<Deps>,
  RouteName extends RouteNameOf<Routes> & RouteLike
>(
  self: SharedRouterValue<Deps, Routes>,
  config: Partial<LinkConfig> = defaultLinkConfig
): (props: LinkProps<RouteName>) => JSX.Element {
  const { router5 } = self;

  const { navActiveClassName = defaultLinkConfig.navActiveClassName } = config;

  return (props: LinkProps<RouteName>): JSX.Element => {
    const [linkProps, innerProps] = splitProps(props, [
      "type",
      "onClick",
      "classList",
      "to",
      "params",
      "nav",
      "navIgnoreParams",
      "disabled",
    ]);

    const isActive =
      linkProps.to !== undefined
        ? useIsActive(
            linkProps.to,
            linkProps.navIgnoreParams ? undefined : linkProps.params
          )
        : alwaysInactive;

    const getClassList = createMemo(() => {
      const classList = linkProps.classList ?? {};
      if (linkProps.type === undefined && linkProps.nav) {
        classList[navActiveClassName] = isActive();
        return classList;
      }
      return classList;
    });

    const getHref: () => string | undefined = createMemo(() => {
      if (linkProps.type === undefined) {
        try {
          return router5.buildPath(
            renderRouteLike(linkProps.to as RouteName),
            linkProps.params
          );
        } catch (err) {
          console.warn("<Link> buildPath failed:", err);
        }
      }
      return undefined;
    });

    return () =>
      linkProps.disabled ? (
        <button
          {...(innerProps as JSX.IntrinsicElements["button"])}
          disabled
          classList={getClassList()}
        />
      ) : (
        <a
          {...(innerProps as JSX.IntrinsicElements["a"])}
          classList={getClassList()}
          href={getHref()}
          onClick={(ev) => {
            ev.preventDefault();
            switch (props.type) {
              case undefined:
                router5.navigate(
                  renderRouteLike(linkProps.to as RouteLike),
                  linkProps.params ?? {}
                );
                if (typeof linkProps.onClick === "function")
                  linkProps.onClick(ev);
                break;
              case LinkNav.Back:
                window.history.back();
                break;
              case LinkNav.Back:
                window.history.back();
                break;
            }
            ev.target.blur();
          }}
        />
      );
  };
}

const alwaysInactive = () => false;

export type FlattenRouteName<A> = A extends [infer X]
  ? X
  : A extends [infer X, ...infer XS]
  ? X extends string
    ? XS extends string[]
      ? `${X}.${FlattenRouteName<XS>}`
      : never
    : never
  : A extends string
  ? A
  : "";

export type RouteNameOf<A> = FlattenRouteName<RouteArrayOf<A>>;

export type ToRouteArray<A> = A extends string
  ? A extends `${infer X}.${infer XS}`
    ? [X, ...ToRouteArray<XS>]
    : [A]
  : [];

export type RouteArrayOf<A> = A extends readonly (infer U)[]
  ? U extends { name: infer Name; children: infer Children }
    ? Children extends {}
      ? ToRouteArray<Name> | [...ToRouteArray<Name>, ...RouteArrayOf<Children>]
      : ToRouteArray<Name>
    : U extends { name: infer Name }
    ? ToRouteArray<Name>
    : []
  : [];

export type UnOne<A> = A extends [infer U] ? U : A;
