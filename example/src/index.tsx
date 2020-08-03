import createSolidRouter, { useRoute } from "solid-typefu-router5";
import browserPluginFactory from "router5-plugin-browser";
import { render } from "solid-js/dom";
import createRouter from "router5";
import { createMemo, For } from "solid-js";

const routes = [{
  name: "foo",
  path: "/foo",
  children: [{
    name: "child1",
    path: "/child1/:id1",
    children: [{ name: "child2", path: "/child2/:id2" }],
  }],
}, {
  name: "bar",
  path: "/bar/:id"
}] as const;

const { Link, Router, Provider: RouterProvider } = createSolidRouter(routes, {
  createRouter5: (routes) => {
    const router = createRouter(routes, { allowNotFound: true });
    router.usePlugin(browserPluginFactory({ useHash: false }));
    return router;
  }
});

const App = (props: { children?: JSX.Element }) => (
  <>
    <div style={{ background: "lightgrey", padding: "0.5rem" }}>
      <h3>Navbar</h3>
      <ul>
        <li>
          <Link nav to="foo">
            foo
          </Link>
        </li>
        <li>
          <Link nav to="bar" params={{ id: 1 }}>
            bar1
          </Link>
        </li>
        <li>
          <Link nav to="bar" params={{ id: 2 }}>
            bar2
          </Link>
        </li>
      </ul>
    </div>
    <div style={{ height: "1rem" }} />
    <div style={{ display: "flex", "flex-direction": "row" }}>
      <div
        style={{ background: "lightblue", "flex-grow": 1, padding: "0.5rem" }}
      >
        {props.children}
      </div>
      <div style={{ width: "1rem" }} />
      <div
        style={{ width: "20em", background: "lightpink", padding: "0.5rem" }}
      >
        <code>
          <pre>{JSON.stringify(useRoute()(), null, 2)}</pre>
        </code>
      </div>
    </div>
  </>);

const Foo = (props: { children?: JSX.Element }) => (
  <div>
    <h1>foo</h1>
    <Link nav to={["foo", "child1"]} params={{ id1: 1 }}>
      foo.child1
    </Link>
    {props.children}
  </div>);

const Child2List = () => {
  const route = useRoute();
  // in reality usePromise(() => api.foo.child1.getChild2s(route().params.id))
  const availId2s = createMemo<number[]>(() => {
    const here = route();
    if (typeof here.params.id1 !== "number") {
      console.warn("id1 was undefined");
    }
    return [1, 2, 3];
  });
  return (
    <>
      <h3>List of foo.child1.child2 links</h3>
      <ul>
        <For each={availId2s()}>
          {id2 => (
            <li>
              <Link
                to={["foo", "child1", "child2"]}
                params={{ id1: route().params.id1, id2 }}
              >
                foo.child1.child2
              </Link>
            </li>
          )}
        </For>
      </ul>
    </>
  );
};

render(
  () => (
    <>
      <style>{`
        html, body { font-family: 'Sedgwick Ave' }
        .is-active { border: 2px solid red; box-shadow: 0 0 30px blue }
      `}</style>
      <RouterProvider>
        <Router>
          {{
            render: App,
            bar: {
              render: () => "bar goes here"
            },
            foo: {
              render: Foo,
              child1: {
                render: p => <div>{p.children}</div>,
                fallback: Child2List,
                child2: {
                  render: () => <>
                    <h3>foo.child1.child2</h3>
                    hello world!
                  </>
                }
              }
            }
          }}
        </Router>
      </RouterProvider>
    </>
  ),
  document.getElementById("app") as any
);
