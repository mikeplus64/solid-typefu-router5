import createSolidRouter, { useRoute } from "solid-typefu-router5";
import browserPluginFactory from "router5-plugin-browser";
import { render } from "solid-js/web";
import createRouter from "router5";
import { createComputed, createSignal, JSX, For } from "solid-js";
import { parse, isValid, startOfToday, format, addDays } from "date-fns";

const routes = [
  {
    name: "parent",
    path: "/parent",
    children: [
      {
        name: "child",
        path: "/:date",
      },
    ],
  },
] as const;

const { Router, Provider: RouterProvider, navigate } = createSolidRouter({
  routes,
  createRouter5: (routes) => {
    const router = createRouter(routes, {
      allowNotFound: true,
      defaultRoute: "parent",
    });
    router.usePlugin(browserPluginFactory({ useHash: false }));
    return router;
  },
});

// Parent element
function Parent(props: { children?: JSX.Element }) {
  const dates = new Array(5)
    .fill(0)
    .map((x, id) => addDays(startOfToday(), id - 3));

  const route = useRoute();
  let routeDate = parse(route().params.date, "dd.MM.yyyy", new Date());
  if (!isValid(routeDate)) routeDate = startOfToday();

  const [selectedDate] = createSignal(routeDate);

  function navigateToDate(date: Date) {
    navigate({
      to: "parent.child",
      params: {
        date: encodeURI(format(date, "dd.MM.yyyy")),
      },
    });
  }

  createComputed(() => {
    navigateToDate(selectedDate());
  });

  return (
    <div>
      <div>Hello from parent!</div>
      <For each={dates}>
        {(date) => (
          <button onClick={() => navigateToDate(date)}>
            {date.toLocaleDateString()}
          </button>
        )}
      </For>
      <div>{props.children}</div>
    </div>
  );
}

// Child element
function Child(props: { date: string }) {
  const route = useRoute();
  return (
    <div>
      <div>Hello from child!</div>
      <div>Date from props: {props.date}</div>
      <div>Date from route().params: {route().params.date}</div>
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <Router>
        {{
          parent: {
            render: Parent,
            child: {
              render: ({ params }) => <Child date={params.date} />,
            },
          },
        }}
      </Router>
    </RouterProvider>
  );
}

render(() => App, document.getElementById("app")!);
