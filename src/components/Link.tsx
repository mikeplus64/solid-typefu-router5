import { SharedRouterValue, RoutesLike } from '../types';
import { isActive, useRouteName } from '../context';
import { createMemo } from 'solid-js';

export enum LinkNav { Back, Forward };

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
export type LinkProps<Route> = {
  disabled?: boolean,
  nav?: boolean,
  onClick?: (ev: MouseEvent & {
    target: HTMLAnchorElement,
    currentTarget: HTMLAnchorElement,
  }) => void,
} & ({
  type: LinkNav.Back | LinkNav.Forward
} | {
  type?: undefined,
  to: Route,
  params?: Record<string, any>,
}) &
  Omit<JSX.IntrinsicElements['a' | 'button'], 'onClick' | 'href' | 'type'>
  ;

export interface LinkConfig {
  navActiveClassName: string,
}

export type RouteLike = string | string[];

export function renderRouteLike(route: RouteLike) {
  if (typeof route === 'string') return route;
  return route.join('.');
}

export const defaultLinkConfig: LinkConfig = {
  navActiveClassName: 'is-active',
};

export default function createLink<Deps, Routes extends RoutesLike<Deps>, RouteName extends RouteNameOf<Routes> & RouteLike>(
  self: SharedRouterValue<Deps, Routes>,
  config: Partial<LinkConfig> = defaultLinkConfig,
): (props: LinkProps<RouteName>) => JSX.Element {

  const { router5 } = self;

  const {
    navActiveClassName = defaultLinkConfig.navActiveClassName,
  } = config;

  return (props: LinkProps<RouteName>): JSX.Element => {

    const getRouteName = useRouteName();

    const getClassList = createMemo(() => {
      const classList = props.classList ?? {};
      if (props.type === undefined && props.nav) {
        classList[navActiveClassName] = isActive(getRouteName(), props.to as RouteLike);
        return classList;
      }
      return classList;
    });

    const getInnerProps = createMemo(() => {
      const {classList: _cl, onClick: _oc, ...innerProps} = props;
      return innerProps;
    });

    const getHref: () => string | undefined = createMemo(() => {
      if (props.type === undefined) {
        try {
          return router5.buildPath(renderRouteLike(props.to), props.params);
        } catch (err) {
          console.warn('<Link> buildPath failed:', err);
        }
      }
      return undefined;
    });

    return () => props.disabled ?
      <button
        {...getInnerProps() as JSX.IntrinsicElements['button']}
        disabled
        classList={getClassList()}
      /> :
      <a
        {...getInnerProps() as JSX.IntrinsicElements['a']}
        classList={getClassList()}
        href={getHref()}
        onClick={(ev) => {
          ev.preventDefault();
          switch (props.type) {
            case undefined:
              router5.navigate(renderRouteLike(props.to as RouteLike), props.params ?? {});
              if (typeof props.onClick === 'function') props.onClick(ev);
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
      />;
  };
}

// Beware, here be dragons
export type RouteNameOf<A> = UnOne<Undefer<Flatten<TreeOf<A>, []>>>;

type TreeOf<A> =
  A extends readonly (infer U)[]
    ? U extends { name: infer Name, children: infer Children }
      ? Children extends {}
        ? [Name] | [Name, TreeOf<Children>]
        : Name
    : U extends { name: infer Name }
      ? [Name]
      : never
  : never;

type UnOne<A> = A extends [infer U] ? U : A;

// This is what requires typescript 4.0+
type Flatten<Arg, Acc extends any[]> =
  Arg extends [infer X]
  ? [...Acc, X]
  : Arg extends [infer X, infer XS]
    ? Defer<Flatten<XS, [...Acc, X]>>
    : never;

// Same trick as in https://github.com/microsoft/TypeScript/pull/21613
interface Defer<X> { self: Undefer<X> }
type Undefer<X> = X extends { self: infer U } ? U : X;
