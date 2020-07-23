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
function useActive(link) {
  const getRouteName = useRouteName();
  return solidJs.createMemo(() => isActive(getRouteName(), link));
}
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
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
    const getRouteName = useRouteName();
    const getClassList = solidJs.createMemo(() => {
      var _props$classList;

      const classList = (_props$classList = props.classList) !== null && _props$classList !== void 0 ? _props$classList : {};

      if (props.type === undefined && props.nav) {
        classList[navActiveClassName] = isActive(getRouteName(), props.to);
        return classList;
      }

      return classList;
    });

    const getInnerProps = () => {
      const {
        classList: _cl,
        onClick: _oc,
        ...innerProps
      } = props;
      return innerProps;
    };

    const getHref = solidJs.createMemo(() => {
      if (props.type === undefined) {
        try {
          return router5.buildPath(renderRouteLike(props.to), props.params);
        } catch (err) {
          console.error(err);
          return '/error';
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

dom.delegateEvents(["click"]);

const _ck$ = ["children"],
      _ck$2 = ["children", "fallback"];
const MatchContext = solidJs.createContext('');

function createGetMatch(props) {
  const route = useRouteNameRaw();
  const ctx = solidJs.useContext(MatchContext);
  const getMatch = solidJs.createMemo(() => {
    const suffix = props.path !== undefined ? props.path : props.prefix;
    const exact = props.path !== undefined;
    const target = ctx !== '' ? `${ctx}.${suffix}` : suffix;
    const here = route();
    return [target, exact ? here === target : here.startsWith(target)];
  }, undefined, (a, b) => a && a[1] === b[1]);
  return getMatch;
}
/**
 * Match against a given route.
 *
 * @remarks
 * Not reactive with regards to the route being matched.
 */


function MatchRoute(props) {
  const getMatch = createGetMatch(props);
  return () => {
    const [value, when] = getMatch();
    return dom.createComponent(dom.Match, {
      when: when,
      children: () => dom.createComponent(MatchContext.Provider, {
        value: value,
        children: () => props.children
      }, _ck$)
    }, _ck$);
  };
}
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

const _ck$$1 = ["children"],
      _ck$2$1 = ["fallback"];
/**
 * Helper function. Use this as a `render` function to just render the children
 * only.
 */

function passthru(props) {
  return props.children;
}
function RouteStateMachine(tree) {
  const getRouteName = useRouteName();

  function traverseHydrate(path0, node0, Render, defaultProps) {
    const [state, setState] = solidJs.createState(defaultProps);
    const getPathSuffix = solidJs.createMemo(() => {
      const p = getRouteName();
      p.splice(0, path0.length);
      return [name, p];
    }, undefined, (a, b) => a && a[0] === b[0]);

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

    solidJs.createEffect(() => {
      const next = {};

      if (populate(getPathSuffix()[1], node0, next, 0) > 0) {
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
          defaultProps
        } = owned;
        return traverseHydrate(path, props, render, defaultProps);
      });
    }

    const children = [];
    const {
      render: RenderHere = passthru,
      fallback: Fallback = () => undefined,
      ...routes
    } = node;

    for (const key in routes) {
      const next = [...path, key];
      const child = routes[key];
      children.push(dom.createComponent(MatchRoute, {
        prefix: key,
        children: () => traverse(next, child)
      }, _ck$$1));
    }

    return dom.createComponent(RenderHere, {
      children: () => dom.createComponent(dom.Switch, {
        fallback: () => dom.createComponent(Fallback, {}),
        children: children
      }, _ck$2$1)
    }, _ck$$1);
  }

  return traverse([], tree);
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
 * function performInitialRedirect(router: Router5) {
 *   ...
 * }
 *
 * export const { Provider, Link, Router } = createSolidRouter(routes, routes => {
 *   return createRouter(routes, {...router5OptionsHere});
 * }, performInitialRedirect);
 * ```
 */

function createSolidRouter(routes, createRouter5, onStart) {
  const router5 = createRouter5(routes); // yolo, hopefully router5 doesn't actually mutate routes =)

  const self = {
    routes,
    router5
  };
  Object.freeze(self);
  return {
    Link: createLink(self),

    Router(props) {
      return RouteStateMachine(props.children);
    },

    Provider(props) {
      var _router5$getState;

      const initialState = (_router5$getState = router5.getState()) !== null && _router5$getState !== void 0 ? _router5$getState : {
        name: ''
      };
      const [getRoute, setRoute] = solidJs.createSignal(initialState);
      const getRouteName = solidJs.createMemo(() => getRoute().name, initialState.name, (a, b) => a === b);
      const getSplitRouteName = solidJs.createMemo(() => getRouteName().split('.'), initialState.name.split('.'));
      const value = {
        getRoute,
        getRouteName: getSplitRouteName,
        getRouteNameRaw: getRouteName,
        router: self
      };
      solidJs.createEffect(() => {
        router5.subscribe(state => setRoute(state.route));
        router5.start();
        if (typeof onStart === 'function') onStart(router5);
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

exports.MatchRoute = MatchRoute;
exports.ShowRoute = ShowRoute;
exports.default = createSolidRouter;
exports.isActive = isActive;
exports.passthru = passthru;
exports.useActive = useActive;
exports.useRoute = useRoute;
exports.useRouteName = useRouteName;
//# sourceMappingURL=index.js.map
