import { UnionToIntersection } from 'ts-essentials';
import { Switch, createState, createEffect, createMemo } from 'solid-js';
import { useRouteName } from '../context';
import { MatchRoute } from './MatchRoute';

/** A tree of route path segments */
export type RenderTreeOf<Tree> =
  Owned<Tree> | RenderNode &
  UnionToIntersection<
    Tree extends readonly (infer Node)[]
    ? Node extends { name: infer Name, children?: infer Children }
      ? Name extends (string | number | symbol)
        ? Children extends {}
          ? { [K in Name]?: RenderTreeOf<Children> }
          : { [K in Name]?: Owned<Children> | RenderNode }
        : never
      : never
    : never
  >;

export interface RenderNode {
  render?(props: { children: JSX.Element }): JSX.Element,
  fallback?(props: { children: JSX.Element }): JSX.Element,
};

export type OwnedBy<Tree, Props> =
  UnionToIntersection<
    Tree extends readonly (infer Node)[]
    ? Node extends { name: infer Name, children?: infer Children }
      ? Name extends (string | number | symbol)
        ? Children extends {}
          ? { [K in Name]?: GetProps<Props> & OwnedBy<Children, Props> }
          : { [K in Name]?: GetProps<Props> }
        : never
      : never
    : never
  >;

export interface OwnedOps<Tree, Props> {
  render: (props: Props) => JSX.Element,

  /**
   * Default prop values for when no matches are found. Props that are optional
   * should be typed as such within `Props` itself.
   */
  defaultProps: Props,

  /**
   * A tree of route paths and prop getters. A prop getter is a function of type
   * `() => PropValue`. The key of the getter determines what prop it gets, and
   * the type of that prop.
   *
   * The tree can go as deep as `Tree` will allow for, with each non-function
   * key corresponding to a path segment in a route.
   */
  props: OwnedBy<Tree, Props>,
}

/** Existential wrapper around `OwnedOps` that hides the inner `Tree` and
 * `Props` types */
export type Owned<Tree> =
  <R>(cont: <Props>(self: OwnedOps<Tree, Props>) => R) => R;

/** Turn an object into the same object, but all its properties are optional and
 * made into functions returning their value */
export type GetProps<Props> =
  { [K in keyof Props]?: () => Props[K] };

/**
 * Helper function. Use this as a `render` function to just render the children
 * only.
 */
export function passthru<T>(props: { children: T }): T {
  return props.children;
}

export default function RouteStateMachine<R extends RenderTreeLike>(tree: R): JSX.Element {
  const getRouteName = useRouteName();

  function traverseHydrate<Props>(
    path0: string[],
    node0: GetPropsLike<Props>,
    render: (props: Props) => JSX.Element,
    defaultProps: Props,
  ): JSX.Element {
    const [state, setState] = createState(defaultProps);

    const getPathSuffix = createMemo<[string, string[]]>(() => {
      const p = getRouteName();
      p.splice(0, path0.length);
      return [name, p];
    }, undefined, (a, b) => a && a[0] === b[0]);

    function populate(
      path: string[],
      node: GetPropsLike<Props>,
      next: Partial<Props>,
      count: number,
    ): number {
      for (const key in node) {
        const gp = (node as GetProps<Props>)[key as keyof Props];
        if (typeof gp === 'function') {
          const value = gp();
          next[key as keyof Props] = value;
          count ++;
          continue;
        }
        if (gp !== undefined) {
          if (path[0] === key) {
            return populate(path.slice(1), gp as any, next, count);
          }
        }
      }
      return count;
    }

    createEffect(() => {
      const next: Partial<Props> = {};
      if (populate(getPathSuffix()[1], node0, next, 0) > 0) {
        setState(next);
      }
    });

    return render(state as Props);
  }

  function traverse(
    path: string[],
    node: RenderTreeLike,
  ): JSX.Element {
    if (typeof node === 'function') {
      return node(function <Props>(owned: OwnedOpsLike<Props>) {
        const { props, render, defaultProps } = owned;
        return traverseHydrate(path, props, render, defaultProps);
      });
    }

    const children: JSX.Element = [];

    const {
      render: RenderHere = passthru,
      fallback: Fallback,
      ...routes
    } = node;

    for (const key in routes) {
      const next = [...path, key];
      const child = routes[key];
      children.push(
        <MatchRoute prefix={key}>
          {() => traverse(next, child)}
        </MatchRoute>);
    }

    return RenderHere({
      children: () => Switch({
        fallback: Fallback === undefined ? undefined : (() => Fallback({ children })),
        children: () => children,
      }),
    });
  }

  return traverse([], tree);
}

/**
 * Monomorphic-ish version of 'GetProps'
 */
type GetPropsLike<Props> =
  { [k: string]: GetPropsLike<Props> } & GetProps<Props>;

/**
 * Monomorphic-ish version of 'OwnedOps'
 */
interface OwnedOpsLike<Props> {
  render: (props: Props) => JSX.Element,
  defaultProps: Props,
  props: GetPropsLike<Props>
}

/**
 * Monomorphic-ish version of 'Owned'
 */
type OwnedLike =
  (cont: <Props>(self: OwnedOpsLike<Props>) => any) => any;

/**
 * Monomorphic-ish version of 'RenderTreeOf'
 */
export type RenderTreeLike
  = OwnedLike
  | (RenderNode & { [k: string]: RenderTreeLike });
