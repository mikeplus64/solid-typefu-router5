import { useContext } from 'solid-js';
import { RouteNode } from 'router5';
import { SharedRouterValue } from '../types';
import Context from '../context';

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
  innerProps?: Omit<JSX.IntrinsicElements['a' | 'button'], 'onClick' | 'href'>,
} & ({
  type: LinkNav.Back | LinkNav.Forward
} | {
  type: undefined,
  to: Route,
  params?: Record<string, any>,
});

export interface LinkConfig {
  navActiveClassName: string,
}

export type RouteLike = string | string[];

/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 */
export function isActive<Route extends RouteLike>(here: string[], link: Route) {
  // just use join/startsWith? never!! =)
  if (typeof link === 'string') {
    let l: string = link;
    let i: number = 0;
    for (; i < here.length; i ++) {
      const seg = here[i];
      if (seg !== l.slice(0, seg.length) || l[seg.length] !== '.') return false;
      l = l.slice(0, seg.length + 1);
    }
    return link.length <= i;
  }
  // if link has more segments than here then it definitely cannot be an
  // ancestor of here
  if (link.length > here.length) return false;
  for (let i = 0; i < link.length; i ++) {
    if (link[i] !== here[i]) return false;
  }
  return true;
}

export function renderRouteLike(route: RouteLike) {
  if (typeof route === 'string') return route;
  return route.join('.');
}

export const defaultLinkConfig: LinkConfig = {
  navActiveClassName: 'is-active',
};

export default function createLink<Deps, Routes extends readonly Partial<RouteNode>[], RouteName extends RouteNameOf<Routes> & RouteLike>(
  self: SharedRouterValue<Deps, Routes>,
  config: Partial<LinkConfig> = defaultLinkConfig,
): (props: LinkProps<RouteName>) => JSX.Element {

  const { router5 } = self;

  const {
    navActiveClassName = defaultLinkConfig.navActiveClassName,
  } = config;

  return (props: LinkProps<RouteName>): JSX.Element => {
    const getRouteName = useContext(Context).getRouteName;

    function classList(): undefined | { [k: string]: undefined | boolean } {
      const classList = props.innerProps?.classList ?? {};
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
        {...props.innerProps as JSX.IntrinsicElements['button']}
        disabled
        classList={classList()}
      /> :
      <a
        {...props.innerProps as JSX.IntrinsicElements['a']}
        classList={classList()}
        href={props.type === undefined ?
          router5.buildPath(renderRouteLike(props.to), props.params) :
          undefined}
        onClick={onClick}
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
