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
function useActive(link) {
  const getRouteName = useRouteName();
  return () => isActive(getRouteName(), link);
}
/**
 * Find whether 'link' is an ancestor of, or equal to, 'here'
 */

function isActive(here, link) {
  // just use join/startsWith? never!! =)
  if (typeof link === 'string') {
    let l = link;
    let i = 0;

    for (; i < here.length; i++) {
      const seg = here[i];
      if (seg !== l.slice(0, seg.length) || l[seg.length] !== '.') return false;
      l = l.slice(0, seg.length + 1);
    }

    return link.length <= i;
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
    return () => props.disabled ? (() => {
      const _el$ = _tmpl$.cloneNode(true);

      dom.spread(_el$, props, false, true);

      dom.insert(_el$, () => props.children);

      dom.effect(_$p => dom.classList(_el$, getClassList(), _$p));

      return _el$;
    })() : (() => {
      const _el$2 = _tmpl$2.cloneNode(true);

      _el$2.__click = ev => {
        var _props$params;

        console.log('hello');
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

      dom.spread(_el$2, props, false, true);

      dom.insert(_el$2, () => props.children);

      dom.effect(_$p => dom.classList(_el$2, getClassList(), _$p));

      return _el$2;
    })();
  };
}

dom.delegateEvents(["click"]);

const MatchContext = solidJs.createContext('');
/**
 * Match against a given route.
 *
 * @remarks
 * Not reactive with regards to the route being matched.
 */

function MatchRoute(props) {
  const route = useRoute();
  const ctx = solidJs.useContext(MatchContext);
  const path = props.path !== undefined ? props.path : props.prefix;
  const exact = props.path !== undefined;
  const to = ctx !== '' ? `${ctx}.${path}` : path;
  return () => solidJs.Match({
    when: exact ? route().name === to : route().name.startsWith(to),
    children: MatchContext.Provider({
      value: to,
      children: () => props.children
    })
  });
}
function ShowRoute(props) {
  const route = useRoute();
  const ctx = solidJs.useContext(MatchContext);
  const path = props.path !== undefined ? props.path : props.prefix;
  const exact = props.path !== undefined;
  const to = ctx !== '' ? `${ctx}.${path}` : path;
  return () => solidJs.Show({
    when: exact ? route().name === to : route().name.startsWith(to),
    fallback: () => props.fallback,
    children: MatchContext.Provider({
      value: to,
      children: () => props.children
    })
  });
}

/**
 * Helper function. Use this as a `render` function to just render the children
 * only.
 */

function passthru(props) {
  return props.children;
}
function RouteStateMachine(tree) {
  const route = useRoute();

  function traverseHydrate(path0, node0, render, defaultProps) {
    const [state, setState] = solidJs.createState(defaultProps);

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

    const getPathSuffix = solidJs.createMemo(() => {
      const name = route().name;
      const p = name.split('.');
      p.splice(0, path0.length);
      return [name, p];
    }, undefined, (a, b) => a && a[0] === b[0]);
    solidJs.createEffect(() => {
      const next = {};

      if (populate(getPathSuffix()[1], node0, next, 0) > 0) {
        setState(next);
      }
    });
    return render(state);
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
    let {
      render: Render,
      fallback,
      ...routes
    } = node;

    if (Render === undefined) {
      Render = passthru;
    }

    if (typeof Render !== 'function') {
      return undefined;
    }

    for (const key in routes) {
      const next = [...path, key];
      const child = routes[key];
      children.push(MatchRoute({
        path: key,
        prefix: undefined,
        children: () => traverse(next, child)
      }));
    }

    return Render({
      children: solidJs.Switch({
        fallback: typeof fallback === 'function' ? fallback({
          children
        }) : undefined,
        children
      })
    });
  }

  return traverse([], tree);
}

const _ck$ = ["children"];
console.log('hello 3');
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
      const [getRoute, setRoute] = solidJs.createSignal(initialState); // create a signal for just the name as a `string` since strings are very
      // easy to compare by `===`

      const [getRouteName, setRouteName] = solidJs.createSignal(initialState.name, (a, b) => a === b);
      const getSplitRouteName = solidJs.createMemo(() => getRouteName().split('.'), initialState.name.split('.'));
      const value = {
        getRoute,
        getRouteName: getSplitRouteName,
        router: self
      };
      solidJs.createEffect(() => {
        router5.subscribe(state => {
          setRoute(state.route);
          setRouteName(state.route.name);
        });
        router5.start();
        if (typeof onStart === 'function') onStart(router5);
      });
      return dom.createComponent(Context.Provider, {
        value: value,
        children: () => props.children
      }, _ck$);
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
