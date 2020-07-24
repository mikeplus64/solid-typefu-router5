import { UnionToIntersection } from 'ts-essentials';
/** A tree of route path segments */
export declare type RenderTreeOf<Tree> = Owned<Tree> | RenderNode & UnionToIntersection<Tree extends readonly (infer Node)[] ? Node extends {
    name: infer Name;
    children?: infer Children;
} ? Name extends (string | number | symbol) ? Children extends {} ? {
    [K in Name]?: RenderTreeOf<Children>;
} : {
    [K in Name]?: Owned<Children> | RenderNode;
} : never : never : never>;
export interface RenderNode {
    render?(props: {
        children: JSX.Element;
    }): JSX.Element;
    fallback?(): JSX.Element;
}
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
declare type GetPropsWith<Props, Tree> = {
    [K in keyof Props & keyof Tree]: Tree[K] | Props[K];
} & Omit<{
    [K in keyof Props]: Props[K];
}, keyof Props> & Omit<{
    [K in keyof Tree]: Tree[K];
}, keyof Tree>;
export interface OwnedOps<Tree, Props> {
    render: (props: Props) => JSX.Element;
    /**
     * Default prop values for when no matches are found. Props that are optional
     * should be typed as such within `Props` itself.
     */
    defaultProps?: Props;
    /**
     * Default prop values for when no matches are found. Props that are optional
     * should be typed as such within `Props` itself.
     */
    defaultGetProps?: GetProps<Props>;
    /**
     * A tree of route paths and prop getters. A prop getter is a function of type
     * `() => PropValue`. The key of the getter determines what prop it gets, and
     * the type of that prop.
     *
     * The tree can go as deep as `Tree` will allow for, with each non-function
     * key corresponding to a path segment in a route.
     */
    props: OwnedBy<Tree, Props>;
}
/** Existential wrapper around `OwnedOps` that hides the inner `Tree` and
 * `Props` types */
export declare type Owned<Tree> = <R>(cont: <Props>(self: OwnedOps<Tree, Props>) => R) => R;
/** Turn an object into the same object, but all its properties are optional and
 * made into functions returning their value */
export declare type GetProps<Props> = {
    [K in keyof Props]?: () => Props[K];
};
/**
 * Helper function. Use this as a `render` function to just render the children
 * only.
 */
export declare function passthru<T>(props: {
    children: T;
}): T;
export default function RouteStateMachine<R extends RenderTreeLike>(tree: R): JSX.Element;
/**
 * Monomorphic-ish version of 'GetProps'
 */
export declare type GetPropsLike<Props> = {
    [k: string]: GetPropsLike<Props>;
} & GetProps<Props>;
/**
 * Monomorphic-ish version of 'OwnedOps'
 */
export interface OwnedOpsLike<Props> {
    render: (props: Props) => JSX.Element;
    defaultProps?: Props;
    defaultGetProps?: GetProps<Props>;
    props: GetPropsLike<Props>;
}
/**
 * Monomorphic-ish version of 'Owned'
 */
export declare type OwnedLike = (cont: <Props>(self: OwnedOpsLike<Props>) => any) => any;
/**
 * Monomorphic-ish version of 'RenderTreeOf'
 */
export declare type RenderTreeLike = OwnedLike | (RenderNode & {
    [k: string]: RenderTreeLike;
});
export {};
//# sourceMappingURL=RouteTree.d.ts.map