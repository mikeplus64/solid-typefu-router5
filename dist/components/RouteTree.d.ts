import { UnionToIntersection } from 'ts-essentials';
import { RouteLike } from './Link';
/**
 * Given a tree of routes and render instructions for each route, return an
 * element that selects the correct renderer for the current route.
 *
 * Also supports using routes to choose how to provide props to a single
 * renderer.
 */
export default function RouteStateMachine<T extends RenderTreeLike, A extends RouteLike>(tree: T, assumed?: A): JSX.Element;
/**
 * Tells `solid-typefu-router5` how to render a node if the path leading to
 * it matches the current route name.
 */
export interface RenderNode {
    /** Default: [[passthru]] */
    render?: (props: {
        children?: JSX.Element;
    }) => JSX.Element;
    /** Fallback children to use if none are available to give to [[render]]. Default: nothing */
    fallback?: JSX.Element;
}
export interface OwnedOps<Tree, Props> {
    /**
     * @remarks If this has a concrete type for its props then TypeScript will be
     * able to infer the structure of [[props]].
     */
    render: (props: Props) => JSX.Element;
    /**
     * Default prop values for when no matches are found. Props that are optional
     * should be typed as such within [[Props]] itself.
     */
    defaultProps?: Props;
    /**
     * Default prop values for when no matches are found. Props that are optional
     * should be typed as such within [[Props]] itself.
     */
    defaultGetProps?: GetProps<Props>;
    /**
     * A tree of route paths and prop getters. A prop getter is a function of type
     * `() => PropValue`. The key of the getter determines what prop it gets, and
     * the type of that prop.
     *
     * The tree can go as deep as [[Tree]] will allow for, with each non-function
     * key corresponding to a path segment in a route.
     */
    props: OwnedBy<Tree, Props>;
}
/** Turn an object into the same object, but all its properties are optional and
 * made into functions returning their value */
export declare type GetProps<Props> = {
    [K in keyof Props]?: () => Props[K];
};
/** Existential wrapper around [[OwnedOps]] that hides the inner [[Tree]] and
 * [[Props]] types */
export declare type Owned<Tree> = <R>(cont: <Props>(self: OwnedOps<Tree, Props>) => R) => R;
/**
 * Helper function. Use this as a [[render]] function to just render the
 * children only.
 */
export declare function passthru<T>(props: {
    children: T;
}): T;
/** A tree of route path segments. Has the same structure as a
 * [[RenderTreeLike]], but the spine of the tree is fixed to use the given
 * [[Tree]] */
export declare type RenderTreeOf<Tree> = Owned<Tree> | RenderNode & UnionToIntersection<Tree extends readonly (infer Node)[] ? Node extends {
    name: infer Name;
    children?: infer Children;
} ? Name extends (string | number | symbol) ? Children extends {} ? {
    [K in Name]?: RenderTreeOf<Children>;
} : {
    [K in Name]?: Owned<Children> | RenderNode;
} : never : never : never>;
export declare type OwnedBy<Tree, Props> = GetPropsWith<GetProps<Props>, UnionToIntersection<Tree extends readonly (infer Node)[] ? Node extends {
    name: infer Name;
    children?: infer Children;
} ? Name extends (string | number | symbol) ? Children extends {} ? {
    [K in Name]?: GetPropsWith<GetProps<Props>, OwnedBy<Children, Props>>;
} : {
    [K in Name]?: GetProps<Props>;
} : never : never : never>>;
/**
 * Allows for conflicts between prop names and route names. At runtime what is a
 * prop or not is simply determined by whether it's a function or not.
 */
export declare type GetPropsWith<Props, Tree> = {
    [K in keyof Props & keyof Tree]: Tree[K] | Props[K];
} & Omit<{
    [K in keyof Props]: Props[K];
}, keyof Tree> & Omit<{
    [K in keyof Tree]: Tree[K];
}, keyof Props>;
export declare type GetPropsLike<Props> = {
    [k: string]: GetPropsLike<Props>;
} & GetProps<Props>;
export declare type RouteNodeLike = {
    name: string;
    children?: RouteTreeLike;
};
export declare type RouteTreeLike = RouteNodeLike[];
export declare type RenderTreeLike = OwnedLike | (RenderNode & {
    [k: string]: RenderTreeLike;
});
export declare type OwnedLike = <R>(cont: <Props>(self: OwnedOpsLike<Props>) => R) => R;
export interface OwnedOpsLike<Props> {
    render: (props: Props) => JSX.Element;
    defaultProps?: Props;
    defaultGetProps?: GetProps<Props>;
    props: GetPropsLike<Props>;
}
export declare type DescendDef<Path, Tree> = Path extends [infer P1, ...infer PS] ? Tree extends readonly (infer Node)[] ? Node extends {
    name: infer Name;
    children?: infer Children;
} ? Name extends P1 ? Defer<DescendDef<PS, Children>> : never : never : never : Tree;
declare type One<T> = T extends any[] ? T : [T];
export declare type Descend<P, T> = Undefer<DescendDef<One<P>, T>>;
interface Defer<X> {
    ____defer: Undefer<X>;
}
declare type Undefer<X> = X extends {
    ____defer: infer U;
} ? U : X;
export {};
//# sourceMappingURL=RouteTree.d.ts.map