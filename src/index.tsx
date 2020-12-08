import { Router as Router5, Route } from "router5";
import { DefaultDependencies } from "router5/dist/types/router";
import { Unsubscribe } from "router5/dist/types/base";
import { JSX, onCleanup, createState, produce } from "solid-js";
import {
  RoutesLike,
  RouteLike,
  RouterState,
  Descend,
  RouteMeta,
  ReadRoutes,
} from "./types";
import Context from "./context";
import Link, { LinkProps } from "./components/Link";
import RouteStateMachine, { RenderTreeLike, RSM } from "./components/RouteTree";
import { ElementOf } from "ts-essentials";

export { MatchRoute, ShowRoute, SwitchRoutes } from "./components/MatchRoute";
export { default as Context, useRoute, useIsActive, isActive } from "./context";

export type { ReadRoutes, ParseParams } from "./types";

/**
 * Create a router for use in solid-js.
 *
 * I'd recommend putting your router in its own file like './router.ts', then
 * exporting the results of this function, like
 *
 * ```ts
 * import { createRouter, Router as Router5 } from 'router5';
 * import { createSolidRouter } from 'solid-ts-router';
 *
 * const routes = [
 *   ...
 * ] as const;
 *
 * // note the "as const" is very important! this causes TypeScript to infer
 * // `routes` as the narrowest possible type.
 *
 * function createRouter5(routes: Route<Deps>[]): Router5 {
 *   return createRouter(...)
 * }
 *
 * function onStart(router: Router5): void {
 *   // initial redirect here
 *   ...
 * }
 *
 * export const { Provider, Link, Router } = createSolidRouter(routes, { createRouter5, onStart });
 * ```
 */

export interface SolidRouter<Deps, RM extends RouteMeta[]> {
  Provider(props: { children: JSX.Element }): JSX.Element;

  /** See [[createLink]] */
  Link(props: LinkProps<ElementOf<RM>>): JSX.Element;

  /** See [[RouteStateMachine]] */
  Router<AssumePath extends ElementOf<RM>["name"] | undefined>(props: {
    children: RSM<AssumePath extends string ? Descend<AssumePath, RM> : RM>;
    assume?: AssumePath;
  }): JSX.Element;

  router: Router5<Deps>;
}

export default function createSolidRouter<
  Routes extends RoutesLike<Deps>,
  Deps = DefaultDependencies
>(config: {
  createRouter5: (
    routes: Route<Deps>[]
  ) => Router5<Deps> | [Router5<Deps>, ...Unsubscribe[]];
  routes: Routes;
  onStart?: (router: Router5<Deps>) => void;
  linkNavActiveClass?: string;
  back?: () => void;
  forward?: () => void;
}): SolidRouter<
  Deps,
  ReadRoutes<Routes> extends infer I
    ? I extends RouteMeta[]
      ? I
      : never
    : never
> {
  let router: Router5<Deps>;
  let unsubs: Unsubscribe[];
  const r = config.createRouter5((config.routes as any) as Route<Deps>[]);
  if (Array.isArray(r)) {
    [router, ...unsubs] = r;
  } else {
    router = r;
    unsubs = [];
  }

  return {
    Link,

    Router: (props) =>
      RouteStateMachine(
        props.children as RenderTreeLike,
        props.assume as RouteLike | undefined
      ),

    Provider: (props: { children: JSX.Element }): JSX.Element => {
      const initialState = router.getState() ?? { name: "" };
      const [state, setState] = createState<RouterState>({
        route: {
          ...initialState,
          nameArray: initialState.name.split("."),
        },
        previousRoute: undefined,
      });

      router.subscribe((rs) => {
        setState(
          produce<RouterState>((s) => {
            s.route = { ...rs.route, nameArray: rs.route.name.split(".") };
            s.previousRoute = rs.previousRoute;
          })
        );
      });

      router.start();

      if (typeof config.onStart === "function") config.onStart(router);

      onCleanup(() => {
        for (const unsub of unsubs) {
          unsub();
        }
        router.stop();
      });

      return (
        <Context.Provider value={{ state, router, config }}>
          {props.children}
        </Context.Provider>
      );
    },

    router,
  };
}
