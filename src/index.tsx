import { Router as Router5, Route } from "router5";
import { DefaultDependencies } from "router5/dist/types/router";
import { Unsubscribe } from "router5/dist/types/base";
import { JSX, onCleanup } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import {
  RoutesLike,
  RouteLike,
  RouterState,
  RouteMeta,
  ReadRoutes,
} from "./types";
import Context from "./context";
import Link, { LinkNav, LinkProps } from "./components/Link";
import RouteStateMachine, { RenderTreeLike, RSM } from "./components/Router";
import { ElementOf } from "ts-essentials";

export { MatchRoute, ShowRoute, SwitchRoutes } from "./components/Switch";
export { default as Context, useRoute, useIsActive, isActive } from "./context";

export type { ReadRoutes, ParseParams } from "./types";

export interface RouterComponent<RM extends RouteMeta[]> {
  <AssumeRoute extends undefined | ElementOf<RM>["name"] = undefined>(props: {
    children: RSM<RM, AssumeRoute>;
    assume?: AssumeRoute;
  }): JSX.Element;
}

export interface LinkComponent<RM extends RouteMeta[]> {
  (props: LinkProps<ElementOf<RM>>): JSX.Element;
}

export interface SolidRouter<Deps, RM extends RouteMeta[]> {
  Provider: (props: { children: JSX.Element }) => JSX.Element;
  /** See [[RouteStateMachine]] */
  Router: RouterComponent<RM>;
  /** See [[createLink]] */
  Link: LinkComponent<RM>;
  navigate(link: LinkNav<ElementOf<RM>>): void;
  router: Router5<Deps>;
}

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
 * export const { Provider, Link, Router } = createSolidRouter({ routes, createRouter5, onStart });
 * ```
 */

export default function createSolidRouter<
  Routes extends RoutesLike<Deps>,
  RM extends ReadRoutes<Routes>,
  Deps = DefaultDependencies
>(config: {
  createRouter5: (
    routes: Route<Deps>[]
  ) => Router5<Deps> | [Router5<Deps>, ...Unsubscribe[]];
  routes: Routes;
  onStart?: (router: Router5<Deps>) => void;
  navActiveClass?: string;
  back?: () => void;
  forward?: () => void;
}): SolidRouter<Deps, RM> {
  let router: Router5<Deps>;
  let unsubs: Unsubscribe[];
  const r = config.createRouter5(config.routes as any as Route<Deps>[]);
  if (Array.isArray(r)) {
    [router, ...unsubs] = r;
  } else {
    router = r;
    unsubs = [];
  }

  return {
    Link,

    navigate: (opts: any) => {
      switch (opts.to) {
        case "@@forward":
          config.forward?.();
          break;
        case "@@back":
          config.back?.();
          break;
        default:
          router.navigate(opts.to, opts.params ?? {});
          break;
      }
    },

    Router: (props: any) =>
      RouteStateMachine(
        props.children as RenderTreeLike,
        props.assume as RouteLike | undefined
      ),

    Provider: (props: { children: JSX.Element }): JSX.Element => {
      const initialState = router.getState() ?? { name: "" };
      const [state, setState] = createStore<RouterState>({
        route: {
          ...initialState,
          nameArray: initialState.name.split("."),
        },
        previousRoute: undefined,
      });

      router.subscribe((rs) => {
        setState(
          reconcile<RouterState>(
            {
              previousRoute: rs.previousRoute,
              route: { ...rs.route, nameArray: rs.route.name.split(".") },
            },
            { key: null, merge: false }
          )
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
  } as any;
}
