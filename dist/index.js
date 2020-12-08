'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var web = require('solid-js/web');
var solidJs = require('solid-js');

const Context = solidJs.createContext();
function useRoute() {
  const ctx = solidJs.useContext(Context);
  return () => ctx.state.route;
}

function paramsEq(a, b) {
  if (a === b) return true;
  if (a === undefined) return b === undefined;
  if (b === undefined) return a === undefined;
  const keys = Object.keys(a);

  for (const key of keys) if (!(key in b)) return false;

  for (const key of keys) if (String(a[key]) !== String(b[key])) return false;

  return keys.length === Object.keys(b).length;
}

function useIsActive(link, params, paramsIsEqual = paramsEq) {
  const state = solidJs.useContext(Context).state;
  const getIsActiveByName = solidJs.createMemo(() => isActive(state.route.name, link));
  return solidJs.createMemo(() => getIsActiveByName() && params !== undefined ? paramsIsEqual(state.route.params, params) : true);
}
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */

function isActive(here, link) {
  return link.startsWith(here);
}

const _tmpl$ = web.template(`<button></button>`, 2),
      _tmpl$2 = web.template(`<a></a>`, 2);
function Link(props) {
  const {
    router: router5,
    config
  } = solidJs.useContext(Context);
  let [linkProps, innerProps] = solidJs.splitProps(props, ["type", "onClick", "classList", "to", "params", "nav", "navIgnoreParams", "navActiveClass", "disabled", "back", "forward", "display"]);
  linkProps = solidJs.assignProps({
    navActiveClass: config.navActiveClass,
    back: config.back,
    forward: config.forward
  }, linkProps);
  const isActive = typeof linkProps.to === "string" ? useIsActive(linkProps.to, linkProps.navIgnoreParams ? undefined : linkProps.params) : alwaysInactive;
  const getHref = solidJs.createMemo(() => {
    if (typeof linkProps.to === "string" && !linkProps.to.startsWith("@@")) {
      try {
        return router5.buildPath(linkProps.to, linkProps.params);
      } catch (err) {
        console.warn("<Link> buildPath failed:", err);
      }
    }

    return undefined;
  });
  const getClassList = solidJs.createMemo(() => {
    const cls = { ...linkProps.classList
    };

    if (typeof linkProps.navActiveClass === "string") {
      cls[linkProps.navActiveClass] = isActive();
    }

    return cls;
  });

  function onClick(ev) {
    var _linkProps$forward, _linkProps, _linkProps$back, _linkProps2, _linkProps$params;

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
        if (typeof linkProps.onClick === "function") linkProps.onClick(ev);
        break;
    }

    ev.target.blur();
  }

  return () => linkProps.display === "button" ? (() => {
    const _el$ = _tmpl$.cloneNode(true);

    _el$.__click = onClick;

    web.spread(_el$, innerProps, false, false);

    web.effect(_p$ => {
      const _v$ = linkProps.disabled,
            _v$2 = getClassList();

      _v$ !== _p$._v$ && (_el$.disabled = _p$._v$ = _v$);
      _p$._v$2 = web.classList(_el$, _v$2, _p$._v$2);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined
    });

    return _el$;
  })() : linkProps.to.startsWith("@@") ? (() => {
    const _el$2 = _tmpl$.cloneNode(true);

    _el$2.__click = onClick;

    web.spread(_el$2, innerProps, false, false);

    web.effect(_$p => web.classList(_el$2, getClassList(), _$p));

    return _el$2;
  })() : (() => {
    const _el$3 = _tmpl$2.cloneNode(true);

    _el$3.__click = onClick;

    web.spread(_el$3, innerProps, false, false);

    web.effect(_p$ => {
      const _v$3 = getClassList(),
            _v$4 = getHref();

      _p$._v$3 = web.classList(_el$3, _v$3, _p$._v$3);
      _v$4 !== _p$._v$4 && web.setAttribute(_el$3, "href", _p$._v$4 = _v$4);
      return _p$;
    }, {
      _v$3: undefined,
      _v$4: undefined
    });

    return _el$3;
  })();
}

const alwaysInactive = () => false;

web.delegateEvents(["click"]);

const MatchContext = solidJs.createContext("");

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
  const ctx = solidJs.useContext(MatchContext);
  const route = useRoute();
  const getIndex = solidJs.createMemo(() => {
    const here = route().name;
    const children = props.children;

    for (let i = 0; i < children.length; i++) {
      const [target, when] = doesMatch(ctx, here, children[i]);
      if (when) return [i, target];
    }

    return undefined;
  }, undefined, (a, b) => {
    const same = a === b || a !== undefined && b !== undefined && a[0] === b[0];
    return same;
  });
  return solidJs.createMemo(() => {
    const ix = getIndex();

    if (ix !== undefined) {
      const [i, target] = ix;
      return web.createComponent(MatchContext.Provider, {
        value: target,

        get children() {
          return props.children[i].children;
        }

      });
    }

    return props.fallback;
  });
}
/**
 * Create a [[Show]] node against a given route.
 */

function ShowRoute(props) {
  const getMatch = createGetMatch(props);
  return () => {
    const [target, when] = getMatch();
    return web.createComponent(solidJs.Show, {
      when: when,

      get fallback() {
        return props.fallback;
      },

      get children() {
        return web.createComponent(MatchContext.Provider, {
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
  return web.createComponent(solidJs.Match, {
    get when() {
      return getMatch()[1];
    },

    get children() {
      return web.createComponent(MatchContext.Provider, {
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
  const ctx = solidJs.useContext(MatchContext);
  return solidJs.createMemo(() => doesMatch(ctx, route().name, props), undefined, (a, b) => a && a[1] === b[1]);
}

/**
 * Given a tree of routes and render instructions for each route, return an
 * element that selects the correct renderer for the current route.
 *
 * Also supports using routes to choose how to provide props to a single
 * renderer.
 */

function RouteStateMachine(tree, _assumed) {
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
        children: traverse(next, child)
      });
    }

    return () => web.createComponent(RenderHere, {
      get params() {
        return route().params;
      },

      get children() {
        return web.createComponent(SwitchRoutes, {
          fallback: () => web.createComponent(RenderFallback, {
            get params() {
              return route().params;
            }

          }),
          children: children
        });
      }

    });
  }

  return solidJs.untrack(() => traverse([], tree));
}

function nofallback() {
  return undefined;
}

function passthru(props) {
  return props.children;
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
      const [state, setState] = solidJs.createState({
        route: { ...initialState,
          nameArray: initialState.name.split(".")
        },
        previousRoute: undefined
      });
      router.subscribe(rs => {
        solidJs.batch(() => {
          setState("previousRoute", solidJs.reconcile(rs.previousRoute));
          setState("route", solidJs.reconcile(rs.route, {
            merge: false,
            key: null
          }));
        });
      });
      router.start();
      if (typeof config.onStart === "function") config.onStart(router);
      solidJs.onCleanup(() => {
        for (const unsub of unsubs) {
          unsub();
        }

        router.stop();
      });
      return web.createComponent(Context.Provider, {
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

exports.Context = Context;
exports.MatchRoute = MatchRoute;
exports.ShowRoute = ShowRoute;
exports.SwitchRoutes = SwitchRoutes;
exports.default = createSolidRouter;
exports.isActive = isActive;
exports.useIsActive = useIsActive;
exports.useRoute = useRoute;
//# sourceMappingURL=index.js.map
