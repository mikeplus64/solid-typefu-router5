'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var web = require('solid-js/web');
var solidJs = require('solid-js');
var store = require('solid-js/store');

const Context = solidJs.createContext();
function requireRouter() {
  const ctx = solidJs.useContext(Context);

  if (ctx === undefined) {
    throw Error("solid-typefu-router5: No router context available");
  }

  return ctx;
}
function useRoute() {
  const ctx = requireRouter();
  return () => ctx.state.route;
}
function paramsEq(current, target) {
  if (current === target) return true;
  if (current === undefined) return target === undefined;
  if (target === undefined) return current === undefined;

  for (const key of Object.keys(target)) {
    if (!(key in current) || current[key] !== target[key]) return false;
  }

  return true;
}
function paramsNeverEq() {
  return false;
}
function useIsActive(getLink, paramsIsEqual = paramsEq) {
  const getRoute = useRoute();
  return solidJs.createMemo(() => {
    const link = getLink();
    const route = getRoute();
    const active = isActive(route.name, link.to);

    if (active > 0) {
      if (paramsIsEqual(route.params, link.params)) {
        return active | exports.RouteActive.EqualParams;
      }
    }

    return active;
  });
}
exports.RouteActive = void 0;

(function (RouteActive) {
  RouteActive[RouteActive["Inactive"] = 0] = "Inactive";
  RouteActive[RouteActive["ActiveRoutePrefix"] = 1] = "ActiveRoutePrefix";
  RouteActive[RouteActive["ActiveRouteExact"] = 2] = "ActiveRouteExact";
  RouteActive[RouteActive["EqualParams"] = 4] = "EqualParams";
})(exports.RouteActive || (exports.RouteActive = {}));
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */


function isActive(here, link) {
  if (link === here) return exports.RouteActive.ActiveRouteExact;
  if (here.startsWith(link + ".")) return exports.RouteActive.ActiveRoutePrefix;
  return exports.RouteActive.Inactive;
}

const _tmpl$ = /*#__PURE__*/web.template(`<button></button>`, 2),
      _tmpl$2 = /*#__PURE__*/web.template(`<a></a>`, 2);
const defaultLinkProps = {
  navActiveClassList: state => {
    return {
      link: true,
      "is-active": state > 0,
      "is-active-prefix": (state & exports.RouteActive.ActiveRoutePrefix) === exports.RouteActive.ActiveRoutePrefix,
      "is-active-exact": (state & exports.RouteActive.ActiveRouteExact) === exports.RouteActive.ActiveRouteExact,
      "has-equal-params": (state & exports.RouteActive.EqualParams) === exports.RouteActive.EqualParams
    };
  }
};
function Link(props) {
  var _config$defaultLinkPr;

  const {
    router: router5,
    config
  } = requireRouter();
  let [linkProps, innerProps] = solidJs.splitProps(props, ["type", "onClick", "classList", "to", "params", "nav", "navIgnoreParams", "navActiveClassList", "disabled", "back", "forward", "display", "openInNewTab"]);
  linkProps = solidJs.mergeProps((_config$defaultLinkPr = config.defaultLinkProps) !== null && _config$defaultLinkPr !== void 0 ? _config$defaultLinkPr : defaultLinkProps, {
    back: config.back,
    forward: config.forward
  }, linkProps);
  const isActive = typeof linkProps.to === "string" ? useIsActive(() => props, linkProps.navIgnoreParams ? paramsNeverEq : paramsEq) : alwaysInactive;
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
    if (linkProps.navActiveClassList !== undefined) {
      return solidJs.mergeProps(linkProps.navActiveClassList(isActive()), linkProps.classList);
    }

    return solidJs.mergeProps(linkProps.classList);
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

  return solidJs.createMemo(() => linkProps.display === "button" ? (() => {
    const _el$ = _tmpl$.cloneNode(true);

    _el$.$$click = onClick;

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

    _el$2.$$click = onClick;

    web.spread(_el$2, innerProps, false, false);

    web.effect(_$p => web.classList(_el$2, getClassList(), _$p));

    return _el$2;
  })() : (() => {
    const _el$3 = _tmpl$2.cloneNode(true);

    web.addEventListener(_el$3, "click", linkProps.openInNewTab ? undefined : onClick, true);

    web.spread(_el$3, innerProps, false, false);

    web.effect(_p$ => {
      const _v$3 = getClassList(),
            _v$4 = getHref(),
            _v$5 = linkProps.openInNewTab ? "_blank" : undefined,
            _v$6 = linkProps.openInNewTab ? "noopener noreferrer" : undefined;

      _p$._v$3 = web.classList(_el$3, _v$3, _p$._v$3);
      _v$4 !== _p$._v$4 && web.setAttribute(_el$3, "href", _p$._v$4 = _v$4);
      _v$5 !== _p$._v$5 && web.setAttribute(_el$3, "target", _p$._v$5 = _v$5);
      _v$6 !== _p$._v$6 && web.setAttribute(_el$3, "rel", _p$._v$6 = _v$6);
      return _p$;
    }, {
      _v$3: undefined,
      _v$4: undefined,
      _v$5: undefined,
      _v$6: undefined
    });

    return _el$3;
  })());
}

const alwaysInactive = () => exports.RouteActive.Inactive;

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
  }, undefined, {
    equals(a, b) {
      const same = a === b || a !== undefined && b !== undefined && a[0] === b[0];
      return same;
    }

  });
  return solidJs.createMemo(() => {
    const ix = getIndex();

    if (ix !== undefined) {
      const [i, target] = ix;
      let children = props.children[i].children; // the following avoids infinite loops where the reactive scope would leak
      // outside of the memo

      if (typeof children === "function") {
        children = solidJs.createMemo(children);
      } else {
        // XXX maybe unnecessary
        children = solidJs.createMemo(() => children);
      }

      return web.createComponent(MatchContext.Provider, {
        value: target,
        children: children
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
  return solidJs.createMemo(() => doesMatch(ctx, route().name, props), undefined, {
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
        children: () => traverse(next, child)
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

  return solidJs.createMemo(() => traverse([], tree));
}

function nofallback() {
  return undefined;
}

function passthru(props) {
  return web.memo(() => props.children);
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
      const [state, setState] = store.createStore({
        route: { ...initialState,
          nameArray: initialState.name.split(".")
        },
        previousRoute: undefined
      });
      router.subscribe(rs => {
        setState(store.reconcile({
          previousRoute: rs.previousRoute,
          route: { ...rs.route,
            nameArray: rs.route.name.split(".")
          }
        }, {
          key: null,
          merge: false
        }));
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
exports["default"] = createSolidRouter;
exports.isActive = isActive;
exports.useIsActive = useIsActive;
exports.useRoute = useRoute;
//# sourceMappingURL=index.js.map
