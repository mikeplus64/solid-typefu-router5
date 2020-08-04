'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var dom = require('solid-js/dom');
var solidJs = require('solid-js');

const Context = solidJs.createContext();
function useRoute() {
  return solidJs.useContext(Context).getRoute;
}
function useRouteName() {
  return solidJs.useContext(Context).getRouteName;
}
function useRouteNameRaw() {
  return solidJs.useContext(Context).getRouteNameRaw;
}

function shallowStringyEq(a, b) {
  if (a === b) return true;
  const keys = Object.keys(a);

  for (const key of keys) if (!(key in b)) return false;

  for (const key of keys) if (String(a[key]) !== String(b[key])) return false;

  return keys.length === Object.keys(b).length;
}

function useIsActive(link, params, isEqual = shallowStringyEq) {
  const getRouteName = useRouteName();
  const getIsActiveByName = solidJs.createMemo(() => isActive(getRouteName(), link));
  if (params === undefined) return getIsActiveByName;
  const getRoute = useRoute();
  const getRouteParams = solidJs.createMemo(() => getRoute().params);
  return solidJs.createMemo(() => {
    const routeParams = getRouteParams();
    return getIsActiveByName() && isEqual(routeParams, params);
  });
}
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 *
 * Maybe useful for creating your own `Link` component.
 */

function isActive(here, link) {
  if (here.length === 0) {
    return false;
  }

  if (typeof link === 'string') {
    return here[0] === link;
  } // if link has more segments than here then it definitely cannot be an
  // ancestor of here


  if (link.length > here.length) return false;

  for (let i = 0; i < link.length; i++) {
    if (link[i] !== here[i]) return false;
  }

  return true;
}

const _tmpl$ = dom.template(`<button disabled=""></button>`, 2),
      _tmpl$2 = dom.template(`<a></a>`, 2);

(function (LinkNav) {
  LinkNav[LinkNav["Back"] = 0] = "Back";
  LinkNav[LinkNav["Forward"] = 1] = "Forward";
})(exports.LinkNav || (exports.LinkNav = {}));
function renderRouteLike(route) {
  if (typeof route === 'string') return route;
  return route.join('.');
}
const defaultLinkConfig = {
  navActiveClassName: 'is-active'
};
function createLink(self, config = defaultLinkConfig) {
  const {
    router5
  } = self;
  const {
    navActiveClassName = defaultLinkConfig.navActiveClassName
  } = config;
  return props => {
    const isActive = props.to !== undefined ? useIsActive(props.to, props.params) : alwaysInactive;
    const getClassList = solidJs.createMemo(() => {
      var _props$classList;

      const classList = (_props$classList = props.classList) !== null && _props$classList !== void 0 ? _props$classList : {};

      if (props.type === undefined && props.nav) {
        classList[navActiveClassName] = isActive();
        return classList;
      }

      return classList;
    });
    const getInnerProps = solidJs.createMemo(() => {
      const {
        classList: _cl,
        onClick: _oc,
        ...innerProps
      } = props;
      return innerProps;
    });
    const getHref = solidJs.createMemo(() => {
      if (props.type === undefined) {
        try {
          return router5.buildPath(renderRouteLike(props.to), props.params);
        } catch (err) {
          console.warn('<Link> buildPath failed:', err);
        }
      }

      return undefined;
    });
    return () => props.disabled ? (() => {
      const _el$ = _tmpl$.cloneNode(true);

      dom.spread(_el$, () => getInnerProps(), false, false);

      dom.effect(_$p => dom.classList(_el$, getClassList(), _$p));

      return _el$;
    })() : (() => {
      const _el$2 = _tmpl$2.cloneNode(true);

      _el$2.__click = ev => {
        var _props$params;

        ev.preventDefault();

        switch (props.type) {
          case undefined:
            router5.navigate(renderRouteLike(props.to), (_props$params = props.params) !== null && _props$params !== void 0 ? _props$params : {});
            if (typeof props.onClick === 'function') props.onClick(ev);
            break;

          case exports.LinkNav.Back:
            window.history.back();
            break;

          case exports.LinkNav.Back:
            window.history.back();
            break;
        }

        ev.target.blur();
      };

      dom.spread(_el$2, () => getInnerProps(), false, false);

      dom.effect(_p$ => {
        const _v$ = getClassList(),
              _v$2 = getHref();

        _p$._v$ = dom.classList(_el$2, _v$, _p$._v$);
        _v$2 !== _p$._v$2 && dom.setAttribute(_el$2, "href", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: undefined,
        _v$2: undefined
      });

      return _el$2;
    })();
  };
}

const alwaysInactive = () => false;

dom.delegateEvents(["click"]);

const _ck$ = ["children"],
      _ck$2 = ["children", "fallback"],
      _ck$3 = ["children", "value"],
      _ck$4 = ["children", "when"];
const MatchContext = solidJs.createContext('');

function doesMatch(ctx, here, props) {
  const suffix = props.path !== undefined ? props.path : props.prefix;
  const exact = props.path !== undefined;
  const target = ctx !== '' ? `${ctx}.${suffix}` : suffix;
  return [target, exact ? here === target : here.startsWith(target)];
}
/**
 * Not reactive on the routes being used
 *
 * Prefer this over [[Switch]] + [[MatchRoute]]
 */


function SwitchRoutes(props) {
  const ctx = solidJs.useContext(MatchContext);
  const route = useRouteNameRaw();
  const getIndex = solidJs.createMemo(() => {
    const here = route();
    const children = props.children;

    for (let i = 0; i < children.length; i++) {
      const [target, when] = doesMatch(ctx, here, children[i]);
      if (when) return [i, target];
    }

    return undefined;
  }, undefined, (a, b) => a === b || a !== undefined && b !== undefined && a[0] === b[0]);
  return () => {
    const ix = getIndex();

    if (ix !== undefined) {
      const [i, target] = ix;
      return dom.createComponent(MatchContext.Provider, {
        value: target,
        children: () => props.children[i].children
      }, _ck$);
    }

    return props.fallback;
  };
}
/**
 * Create a [[Show]] node against a given route.
 */

function ShowRoute(props) {
  const getMatch = createGetMatch(props);
  return () => {
    const [target, when] = getMatch();
    return dom.createComponent(dom.Show, {
      when: when,
      fallback: () => props.fallback,
      children: () => dom.createComponent(MatchContext.Provider, {
        value: target,
        children: () => props.children
      }, _ck$)
    }, _ck$2);
  };
}
/**
 * Create a [[Match]] node against a given route.
 */

function MatchRoute(props) {
  const getMatch = createGetMatch(props);
  return dom.createComponent(dom.Match, {
    when: () => getMatch()[1],
    children: () => dom.createComponent(MatchContext.Provider, {
      value: () => getMatch()[0],
      children: () => props.children
    }, _ck$3)
  }, _ck$4);
}

function createGetMatch(props) {
  const route = useRouteNameRaw();
  const ctx = solidJs.useContext(MatchContext);
  return solidJs.createMemo(() => doesMatch(ctx, route(), props), undefined, (a, b) => a && a[1] === b[1]);
}

const _ck$$1 = ["children"],
      _ck$2$1 = ["children", "prefix"];
/**
 * Given a tree of routes and render instructions for each route, return an
 * element that selects the correct renderer for the current route.
 *
 * Also supports using routes to choose how to provide props to a single
 * renderer.
 */

function RouteStateMachine(tree, assumed) {
  const getRouteName = useRouteName();

  function traverseHydrate(path0, node0, Render, defaultGetProps, defaultProps) {
    const [state, setState] = solidJs.createState(defaultProps !== null && defaultProps !== void 0 ? defaultProps : {});
    const numDefaultGetProps = Object.keys(defaultProps !== null && defaultProps !== void 0 ? defaultProps : {}).length;
    const getPathSuffix = solidJs.createMemo(() => [name, getRouteName().slice(0, path0.length)], undefined, (a, b) => a && a[0] === b[0]);

    function populate(path, node, next, count) {
      for (const key in node) {
        const gp = node[key];

        if (typeof gp === 'function') {
          const value = gp();
          next[key] = value;
          count++;
          continue;
        }

        if (gp !== undefined) {
          if (path[0] === key) {
            return populate(path.slice(1), gp, next, count);
          }
        }
      }

      return count;
    }

    function populateFromDefaultGetProps(next) {
      if (defaultGetProps === undefined) {
        return 0;
      }

      let count = 0;

      for (const k_ in defaultGetProps) {
        const k = k_;

        if (next[k] === undefined) {
          const fn = defaultGetProps[k];

          if (typeof fn === 'function') {
            next[k] = fn();
            count++;
          }
        }
      }

      return count;
    }

    solidJs.createEffect(() => {
      const next = {};
      let got = populate(getPathSuffix()[1], node0, next, 0);

      if (got < numDefaultGetProps) {
        got += populateFromDefaultGetProps(next);
      }

      if (got > 0) {
        setState(next);
      }
    });
    return dom.createComponent(Render, Object.assign(Object.keys(state).reduce((m$, k$) => (m$[k$] = () => state[k$], m$), {}), {}), Object.keys(state));
  }

  function traverse(path, node) {
    if (typeof node === 'function') {
      return node(function (owned) {
        const {
          props,
          render,
          defaultGetProps,
          defaultProps
        } = owned;
        return traverseHydrate(path, props, render, defaultGetProps, defaultProps);
      });
    }

    const children = [];
    const {
      render: RenderHere = passthru,
      fallback,
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

    return dom.createComponent(RenderHere, {
      children: () => dom.createComponent(SwitchRoutes, {
        fallback: fallback,
        children: children
      })
    }, _ck$$1);
  }

  if (assumed === undefined) {
    return traverse([], tree);
  }

  return dom.createComponent(ShowRoute, {
    prefix: () => renderRouteLike(assumed),
    children: () => traverse([], tree)
  }, _ck$2$1);
}
/**
 * Helper function. Use this as a [[render]] function to just render the
 * children only.
 */

function passthru(props) {
  return props.children;
}

const _ck$$2 = ["children"];
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

function createSolidRouter(routes, {
  createRouter5,
  onStart,
  link: linkConfig
}) {
  const [router5, unsubs] = (() => {
    let router5;
    let unsubs;
    const r = createRouter5(routes);

    if (Array.isArray(r)) {
      [router5, ...unsubs] = r;
    } else {
      router5 = r;
      unsubs = [];
    }

    return [router5, unsubs];
  })(); // yolo, hopefully router5 doesn't actually mutate routes =)


  const self = {
    routes,
    router5
  };
  Object.freeze(self);
  return {
    Link: createLink(self, linkConfig),

    Router(props) {
      return RouteStateMachine(props.children, props.assume);
    },

    Provider(props) {
      var _router5$getState;

      const initialState = (_router5$getState = router5.getState()) !== null && _router5$getState !== void 0 ? _router5$getState : {
        name: ''
      };
      const [getRoute, setRoute] = solidJs.createSignal(initialState);
      const getRouteName = solidJs.createMemo(() => getRoute().name, initialState.name, (a, b) => a === b);
      const getSplitRouteName = solidJs.createMemo(() => Object.freeze(getRouteName().split('.')), initialState.name.split('.'));
      const value = {
        getRoute,
        getRouteName: getSplitRouteName,
        getRouteNameRaw: getRouteName,
        router: self
      };
      solidJs.createEffect(() => {
        router5.subscribe(state => setRoute(Object.freeze(state.route)));
        router5.start();
        if (typeof onStart === 'function') onStart(router5);
      });
      solidJs.onCleanup(() => {
        for (const unsub of unsubs) {
          unsub();
        }

        router5.stop();
      });
      return dom.createComponent(Context.Provider, {
        value: value,
        children: () => props.children
      }, _ck$$2);
    },

    router: self,
    hints: {}
  };
}

exports.Context = Context;
exports.MatchRoute = MatchRoute;
exports.ShowRoute = ShowRoute;
exports.SwitchRoutes = SwitchRoutes;
exports.default = createSolidRouter;
exports.isActive = isActive;
exports.passthru = passthru;
exports.useIsActive = useIsActive;
exports.useRoute = useRoute;
exports.useRouteName = useRouteName;
//# sourceMappingURL=index.js.map
