import { UnionToIntersection } from 'ts-essentials';
export declare type RenderTreeOf<Tree> = Owned<Tree> | RenderNode & UnionToIntersection<Tree extends readonly (infer Node)[] ? Node extends {
    name: infer Name;
    children?: infer Children;
} ? Name extends (string | number | symbol) ? Children extends {} ? {
    [K in Name]?: RenderTreeOf<Children>;
} : {
    [K in Name]?: Owned<Children> | RenderNode;
} : never : never : never>;
interface RenderNode {
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
interface OwnedOps<Tree, Props> {
    render: (props: Props) => JSX.Element;
    defaultProps: Props;
    props: OwnedBy<Tree, Props>;
}
declare type Owned<Tree> = <R>(cont: <Props>(self: OwnedOps<Tree, Props>) => R) => R;
declare type GetProps<Props> = {
    [K in keyof Props]?: () => Props[K];
};
export declare function passthru<T>(props: {
    children: T;
}): T;
export default function sm<R extends RenderTreeLike>(tree: R): JSX.Element;
declare type GetPropsLike<Props> = {
    [k: string]: GetPropsLike<Props>;
} & GetProps<Props>;
interface OwnedOpsLike<Props> {
    render: (props: Props) => JSX.Element;
    defaultProps: Props;
    props: GetPropsLike<Props>;
}
declare type OwnedLike = (cont: <Props>(self: OwnedOpsLike<Props>) => any) => any;
export declare type RenderTreeLike = OwnedLike | (RenderNode & {
    [k: string]: RenderTreeLike;
});
export {};
//# sourceMappingURL=stateMachine.d.ts.map