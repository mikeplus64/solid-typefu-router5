import { SharedRouterValue, RoutesLike } from '../types';
import { isActive, useRouteName } from '../context';

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
  children?: JSX.Element,
} & ({
  type: LinkNav.Back | LinkNav.Forward
} | {
  type?: undefined,
  to: Route,
  params?: Record<string, any>,
}) &
  Omit<JSX.IntrinsicElements['a' | 'button'], 'onClick' | 'href' | 'children' | 'type'>
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
    console.log('make link');
    const getRouteName = useRouteName();

    function classList(): undefined | { [k: string]: undefined | boolean } {
      const classList = props.classList ?? {};
      if (props.type === undefined && props.nav) {
        classList[navActiveClassName] = isActive(getRouteName(), props.to as RouteLike);
        return classList;
      }
      return classList;
    }

    function onClick(ev: MouseEvent & { target: HTMLAnchorElement, currentTarget: HTMLAnchorElement }) {
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
    }

    return props.disabled ?
      <button
        {...props as JSX.IntrinsicElements['button']}
        disabled
        classList={classList()}
        children={props.children}
      /> :
      <a
        {...props as JSX.IntrinsicElements['a']}
        classList={classList()}
        href={props.type === undefined ?
          router5.buildPath(renderRouteLike(props.to), props.params) :
          undefined}
        onClick={onClick}
        children={props.children}
      />;
  }
}

// Beware, here be dragons

export type RouteNameOf<A> = UnOne<Exp<TreeOf<A>>>;

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
type Exp<Arg> = Arg extends [infer X]
  ? [X] : Arg extends [infer X, infer XS]
  ? [X, ...Exp1<XS>] : never;

type Exp1<Arg> = Arg extends [infer X]
  ? [X] : Arg extends [infer X, infer XS]
  ? [X, ...Exp2<XS>] : never;

type Exp2<Arg> = Arg extends [infer X]
  ? [X] : Arg extends [infer X, infer XS]
  ? [X, ...Exp3<XS>] : never;

type Exp3<Arg> = Arg extends [infer X]
  ? [X] : Arg extends [infer X, infer XS]
  ? [X, ...Exp4<XS>] : never;

type Exp4<Arg> = Arg extends [infer X]
  ? [X] : Arg extends [infer X, infer XS]
  ? [X, ...Exp5<XS>] : never;

type Exp5<Arg> = Arg extends [infer X]
  ? [X] : Arg extends [infer X, infer XS]
  ? [X, ...Exp6<XS>] : never;

type Exp6<Arg> = Arg extends [infer X]
  ? [X] : Arg extends [infer X, any]
  ? [X, ...never] : never;
