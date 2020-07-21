import { useContext, createContext, Match, Show, Switch, createState, createMemo, createEffect, createSignal } from 'solid-js';
import { spread, insert, effect, classList, setAttribute, template, delegateEvents } from 'solid-js/dom';

const _tmpl$ = template(`<button disabled=""></button>`, 2),
      _tmpl$2 = template(`<a></a>`, 2);
var LinkNav;

(function (LinkNav) {
  LinkNav[LinkNav["Back"] = 0] = "Back";
  LinkNav[LinkNav["Forward"] = 1] = "Forward";
})(LinkNav || (LinkNav = {}));
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
    const getRouteName = useContext(Context).getRouteName;

    function classList$1() {
      var _props$classList;

      const classList = (_props$classList = props.classList) !== null && _props$classList !== void 0 ? _props$classList : {};

      if (props.type === undefined && props.nav) {
        classList[navActiveClassName] = isActive(getRouteName(), props.to);
        return classList;
      }

      return classList;
    }

    function onClick(ev) {
      var _props$params;

      ev.preventDefault();

      switch (props.type) {
        case undefined:
          router5.navigate(renderRouteLike(props.to), (_props$params = props.params) !== null && _props$params !== void 0 ? _props$params : {});
          if (typeof props.onClick === 'function') props.onClick(ev);
          break;

        case LinkNav.Back:
          window.history.back();
          break;

        case LinkNav.Back:
          window.history.back();
          break;
      }

      ev.target.blur();
    }

    return props.disabled ? (() => {
      const _el$ = _tmpl$.cloneNode(true);

      spread(_el$, props, false, false);

      insert(_el$, () => props.children);

      effect(_$p => classList(_el$, classList$1(), _$p));

      return _el$;
    })() : (() => {
      const _el$2 = _tmpl$2.cloneNode(true);

      _el$2.__click = onClick;

      spread(_el$2, props, false, false);

      insert(_el$2, () => props.children);

      effect(_p$ => {
        const _v$ = classList$1(),
              _v$2 = props.type === undefined ? router5.buildPath(renderRouteLike(props.to), props.params) : undefined;

        _p$._v$ = classList(_el$2, _v$, _p$._v$);
        _v$2 !== _p$._v$2 && setAttribute(_el$2, "href", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: undefined,
        _v$2: undefined
      });

      return _el$2;
    })();
  };
}

delegateEvents(["click"]);

const Context = createContext();
function useRoute() {
  return useContext(Context).getRoute;
}
function useRouteName() {
  return useContext(Context).getRouteName;
}
function useActive(link) {
  const getRouteName = useRouteName();
  return () => isActive(getRouteName(), link);
}

const MatchContext = createContext('');
/**
 * Match against a given route.
 *
 * @remarks
 * Not reactive with regards to the route being matched.
 */

function MatchRoute(props) {
  const route = useRoute();
  const ctx = useContext(MatchContext);
  const path = props.path !== undefined ? props.path : props.prefix;
  const exact = props.path !== undefined;
  const to = ctx !== '' ? `${ctx}.${path}` : path;
  return () => Match({
    when: exact ? route().name === to : route().name.startsWith(to),
    children: MatchContext.Provider({
      value: to,
      children: () => props.children
    })
  });
}
function ShowRoute(props) {
  const route = useRoute();
  const ctx = useContext(MatchContext);
  const path = props.path !== undefined ? props.path : props.prefix;
  const exact = props.path !== undefined;
  const to = ctx !== '' ? `${ctx}.${path}` : path;
  return () => Show({
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
    const [state, setState] = createState(defaultProps);

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

    const getPathSuffix = createMemo(() => {
      const name = route().name;
      const p = name.split('.');
      p.splice(0, path0.length);
      return [name, p];
    }, undefined, (a, b) => a && a[0] === b[0]);
    createEffect(() => {
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
      children: Switch({
        fallback: typeof fallback === 'function' ? fallback({
          children
        }) : undefined,
        children
      })
    });
  }

  return traverse([], tree);
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
      const [getRoute, setRoute] = createSignal(initialState); // create a signal for just the name as a `string` since strings are very
      // easy to compare by `===`

      const [getRouteName, setRouteName] = createSignal(initialState.name, (a, b) => a === b);
      const getSplitRouteName = createMemo(() => getRouteName().split('.'), initialState.name.split('.'));
      createEffect(() => {
        router5.subscribe(state => {
          setRoute(state.route);
          setRouteName(state.route.name);
        });
        router5.start();
        if (typeof onStart === 'function') onStart(router5);
      });
      return Context.Provider({
        value: {
          getRoute,
          getRouteName: getSplitRouteName,
          router: self
        },
        children: props.children
      });
    },

    router: self,
    hints: {}
  };
}

export default createSolidRouter;
export { LinkNav, MatchRoute, ShowRoute, isActive, passthru, useActive, useRoute, useRouteName };
//# sourceMappingURL=index.es.js.map
