import { spread, mergeProps as mergeProps$1, template, createComponent, memo } from 'solid-js/web';
import { createContext, createMemo, useContext, splitProps, mergeProps, untrack, Show, Match, onCleanup } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

const Context = createContext();
function requireRouter() {
  const ctx = useContext(Context);
  if (ctx === undefined) {
    throw Error("solid-typefu-router5: No router context available");
  }
  return ctx;
}
function useRoute() {
  const ctx = requireRouter();
  return () => ctx.state.route;
}
function useIsActive(getLink, opts) {
  const ctx = requireRouter();
  return createMemo(() => {
    const {
      to,
      params
    } = getLink();
    return ctx.router.isActive(to, params, opts === null || opts === void 0 ? void 0 : opts.strictEquality, opts === null || opts === void 0 ? void 0 : opts.ignoreQueryParams);
  });
}

const _tmpl$ = /*#__PURE__*/template(`<button></button>`, 2),
  _tmpl$2 = /*#__PURE__*/template(`<a></a>`, 2);
function Link(props) {
  var _config$defaultLinkPr;
  const {
    router: router5,
    config
  } = requireRouter();
  let [linkProps, innerProps] = splitProps(props, ["type", "onClick", "classList", "to", "params", "nav", "navIsActive", "navActiveClass", "disabled", "back", "forward", "display", "openInNewTab"]);
  linkProps = mergeProps((_config$defaultLinkPr = config.defaultLinkProps) !== null && _config$defaultLinkPr !== void 0 ? _config$defaultLinkPr : defaultLinkProps, {
    back: config.back,
    forward: config.forward
  }, linkProps);
  const getHref = createMemo(() => {
    const {
      to,
      params
    } = linkProps;
    if (typeof to === "string" && !to.startsWith("@@")) {
      try {
        return router5.buildPath(to, params);
      } catch (err) {
        console.warn("<Link> buildPath failed:", err);
      }
    }
    return undefined;
  });
  //
  // micro-opt: if we dont have a 'nav' prop then dont make memos for isActive
  // and getClassList at all
  //
  const haveNavProp = untrack(() => "nav" in linkProps);
  const isActive = !haveNavProp ? alwaysInactive : createMemo(() => {
    const {
      to,
      nav,
      navIsActive
    } = linkProps;
    if (!nav || typeof to !== "string") return alwaysInactive;
    return useIsActive(() => props, navIsActive);
  });
  const getClassList = !haveNavProp ? () => linkProps.classList : createMemo(() => {
    const {
      navActiveClass,
      classList
    } = linkProps;
    if (typeof navActiveClass === "string") {
      return mergeProps({
        [navActiveClass]: isActive()
      }, classList);
    }
    return classList;
  });
  function onClick(ev) {
    var _linkProps$forward, _linkProps, _linkProps$back, _linkProps2, _linkProps$params, _linkProps$onClick, _linkProps3;
    ev.preventDefault();
    switch (linkProps.to) {
      case "@@forward":
        (_linkProps$forward = (_linkProps = linkProps).forward) === null || _linkProps$forward === void 0 ? void 0 : _linkProps$forward.call(_linkProps);
        break;
      case "@@back":
        (_linkProps$back = (_linkProps2 = linkProps).back) === null || _linkProps$back === void 0 ? void 0 : _linkProps$back.call(_linkProps2);
        break;
      default:
        router5.navigate(linkProps.to, (_linkProps$params = linkProps.params) !== null && _linkProps$params !== void 0 ? _linkProps$params : {});
        (_linkProps$onClick = (_linkProps3 = linkProps).onClick) === null || _linkProps$onClick === void 0 ? void 0 : _linkProps$onClick.call(_linkProps3, ev);
        break;
    }
    ev.target.blur();
  }
  return createMemo(() => linkProps.display === "button" ? (() => {
    const _el$ = _tmpl$.cloneNode(true);
    spread(_el$, mergeProps$1(innerProps, {
      get disabled() {
        return linkProps.disabled;
      },
      get classList() {
        return getClassList();
      },
      "onClick": onClick
    }), false, false);
    return _el$;
  })() : linkProps.to.startsWith("@@") ? (() => {
    const _el$2 = _tmpl$.cloneNode(true);
    spread(_el$2, mergeProps$1(innerProps, {
      get classList() {
        return getClassList();
      },
      "onClick": onClick
    }), false, false);
    return _el$2;
  })() : (() => {
    const _el$3 = _tmpl$2.cloneNode(true);
    spread(_el$3, mergeProps$1(innerProps, {
      get classList() {
        return getClassList();
      },
      get href() {
        return getHref();
      },
      get target() {
        return linkProps.openInNewTab ? "_blank" : undefined;
      },
      get rel() {
        return linkProps.openInNewTab ? "noopener noreferrer" : undefined;
      },
      get onClick() {
        return linkProps.openInNewTab ? undefined : onClick;
      }
    }), false, false);
    return _el$3;
  })());
}
const defaultLinkProps = {
  navActiveClass: "is-active",
  navIsActive: {
    ignoreQueryParams: true,
    strictEquality: false
  }
};
const alwaysInactive = () => false;

const MatchContext = createContext("");
function doesMatch(ctx, here, props) {
  const suffix = props.path !== undefined ? props.path : props.prefix;
  const exact = props.path !== undefined;
  const target = ctx !== "" ? `${ctx}.${suffix}` : suffix;
  return [target, exact ? here === target : here.startsWith(target)];
}
/**
 * Not reactive on the routes being used
 *
 * Prefer this over [[Switch]] + [[MatchRoute]]
 */
function SwitchRoutes(props) {
  const ctx = useContext(MatchContext);
  const route = useRoute();
  const getIndex = createMemo(() => {
    const here = route().name;
    const children = props.children;
    for (let i = 0; i < children.length; i++) {
      const [target, when] = doesMatch(ctx, here, children[i]);
      if (when) return [i, target];
    }
    return undefined;
  }, undefined, {
    equals(a, b) {
      const same = a === b || a !== undefined && b !== undefined && a[0] === b[0];
      return same;
    }
  });
  return untrack(() => createMemo(() => {
    const ix = getIndex();
    if (ix !== undefined) {
      const [i, target] = ix;
      return createComponent(MatchContext.Provider, {
        value: target,
        get children() {
          return props.children[i].children;
        }
      });
    }
    return props.fallback;
  }));
}
/**
 * Create a [[Show]] node against a given route.
 */
function ShowRoute(props) {
  const getMatch = createGetMatch(props);
  return () => {
    const [target, when] = getMatch();
    return createComponent(Show, {
      when: when,
      get fallback() {
        return props.fallback;
      },
      get children() {
        return createComponent(MatchContext.Provider, {
          value: target,
          get children() {
            return props.children;
          }
        });
      }
    });
  };
}
/**
 * Create a [[Match]] node against a given route.
 */
function MatchRoute(props) {
  const getMatch = createGetMatch(props);
  return createComponent(Match, {
    get when() {
      return getMatch()[1];
    },
    get children() {
      return createComponent(MatchContext.Provider, {
        get value() {
          return getMatch()[0];
        },
        get children() {
          return props.children;
        }
      });
    }
  });
}
function createGetMatch(props) {
  const route = useRoute();
  const ctx = useContext(MatchContext);
  return createMemo(() => doesMatch(ctx, route().name, props), undefined, {
    equals: (a, b) => a !== undefined && (a === null || a === void 0 ? void 0 : a[1]) === (b === null || b === void 0 ? void 0 : b[1])
  });
}

/**
 * Given a tree of routes and render instructions for each route, return an
 * element that selects the correct renderer for the current route.
 *
 * Also supports using routes to choose how to provide props to a single
 * renderer.
 */
function RouteStateMachine(tree, _assumed) {
  // const owner = getOwner();
  const route = useRoute();
  function traverse(path, node) {
    const children = [];
    const {
      render: RenderHere = passthru,
      fallback: RenderFallback = nofallback,
      ...routes
    } = node;
    for (const key in routes) {
      const next = [...path, key];
      const child = routes[key];
      children.push({
        prefix: key,
        children: () => untrack(() => traverse(next, child))
      });
    }
    return () => untrack(() => createComponent(RenderHere, {
      get params() {
        return route().params;
      },
      get children() {
        return createComponent(SwitchRoutes, {
          fallback: () => createComponent(RenderFallback, {
            get params() {
              return route().params;
            }
          }),
          children: children
        });
      }
    }));
  }
  return untrack(() => createMemo(() => traverse([], tree)));
}
function nofallback() {
  return undefined;
}
function passthru(props) {
  return memo(() => props.children);
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
function createSolidRouter(config) {
  let router;
  let unsubs;
  const r = config.createRouter5(config.routes);
  if (Array.isArray(r)) {
    [router, ...unsubs] = r;
  } else {
    router = r;
    unsubs = [];
  }
  return {
    Link,
    navigate: opts => {
      var _config$forward, _config$back, _opts$params;
      switch (opts.to) {
        case "@@forward":
          (_config$forward = config.forward) === null || _config$forward === void 0 ? void 0 : _config$forward.call(config);
          break;
        case "@@back":
          (_config$back = config.back) === null || _config$back === void 0 ? void 0 : _config$back.call(config);
          break;
        default:
          router.navigate(opts.to, (_opts$params = opts.params) !== null && _opts$params !== void 0 ? _opts$params : {});
          break;
      }
    },
    Router: props => RouteStateMachine(props.children, props.assume),
    Provider: props => {
      var _router$getState;
      const initialState = (_router$getState = router.getState()) !== null && _router$getState !== void 0 ? _router$getState : {
        name: ""
      };
      const [state, setState] = createStore({
        route: {
          ...initialState,
          nameArray: initialState.name.split(".")
        },
        previousRoute: undefined
      });
      router.subscribe(rs => {
        setState(reconcile({
          previousRoute: rs.previousRoute,
          route: {
            ...rs.route,
            nameArray: rs.route.name.split(".")
          }
        }, {
          key: null,
          merge: false
        }));
      });
      router.start();
      if (typeof config.onStart === "function") config.onStart(router);
      onCleanup(() => {
        for (const unsub of unsubs) {
          unsub();
        }
        router.stop();
      });
      return createComponent(Context.Provider, {
        value: {
          state,
          router,
          config
        },
        get children() {
          return props.children;
        }
      });
    },
    router
  };
}

export { Context, MatchRoute, ShowRoute, SwitchRoutes, createSolidRouter as default, useIsActive, useRoute };
//# sourceMappingURL=index.es.js.map
