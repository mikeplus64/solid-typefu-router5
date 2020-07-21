import { UnionToIntersection } from 'ts-essentials';
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
    fallback?(props: {
        children: JSX.Element;
    }): JSX.Element;
}
export declare type OwnedBy<Tree, Props> = UnionToIntersection<Tree extends readonly (infer Node)[] ? Node extends {
    name: infer Name;
    children?: infer Children;
} ? Name extends (string | number | symbol) ? Children extends {} ? {
    [K in Name]?: GetProps<Props> & OwnedBy<Children, Props>;
} : {
    [K in Name]?: GetProps<Props>;
} : never : never : never>;
export interface OwnedOps<Tree, Props> {
    render: (props: Props) => JSX.Element;
    defaultProps: Props;
    props: OwnedBy<Tree, Props>;
}
export declare type Owned<Tree> = <R>(cont: <Props>(self: OwnedOps<Tree, Props>) => R) => R;
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
export default function sm<R extends RenderTreeLike>(tree: R): JSX.Element;
/**
 * Monomorphic-ish version of 'GetProps'
 */
declare type GetPropsLike<Props> = {
    [k: string]: GetPropsLike<Props>;
} & GetProps<Props>;
/**
 * Monomorphic-ish version of 'OwnedOps'
 */
interface OwnedOpsLike<Props> {
    render: (props: Props) => JSX.Element;
    defaultProps: Props;
    props: GetPropsLike<Props>;
}
/**
 * Monomorphic-ish version of 'Owned'
 */
declare type OwnedLike = (cont: <Props>(self: OwnedOpsLike<Props>) => any) => any;
/**
 * Monomorphic-ish version of 'RenderTreeOf'
 */
export declare type RenderTreeLike = OwnedLike | (RenderNode & {
    [k: string]: RenderTreeLike;
});
export {};
//# sourceMappingURL=Router.d.ts.map