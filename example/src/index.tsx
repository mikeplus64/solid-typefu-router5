import createSolidRouter, { useRoute } from "solid-typefu-router5";
import browserPluginFactory from "router5-plugin-browser";
import { render } from "solid-js/web";
import createRouter from "router5";
import { For } from "solid-js";

const routes = [
  { name: "home", path: "/" },
  {
    name: "users",
    path: "/users?page",
    children: [
      { name: "profile", path: "/:id<\\d+>" },
      { name: "edit", path: "/edit" },
    ],
  },
  { name: "about", path: "/about" },
] as const;

const { Link, Router, Provider } = createSolidRouter({
  routes,
  navActiveClass: "is-active",
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  createRouter5: (routes) => {
    const router = createRouter(routes, { allowNotFound: true });
    router.usePlugin(browserPluginFactory({ useHash: false }));
    return router;
  },
});

const About = () => (
  <>
    <h1>About</h1>
    <p>
      This is the about page of the <code>solid-typefu-router5</code> example
      project.
    </p>
  </>
);

const Home = () => (
  <>
    <h1>Home</h1>
    <p>
      This is the <code>solid-typefu-router5</code> example project.
    </p>
  </>
);

function userList(page: number) {
  return [5 * page, 5 * page + 1, 5 * page + 2, 5 * page + 3, 5 * page + 4];
}

const Users = (props: { page: number }) => (
  <>
    <h1>Users</h1>
    <p>Page: {props.page}</p>
    <ul>
      <For each={userList(props.page)}>
        {(user) => (
          <li>
            <Link to="users.profile" params={{ id: "" + user }}>
              To user {user}
            </Link>
          </li>
        )}
      </For>
    </ul>
    <Link
      to="users"
      params={{ page: "" + (props.page - 1) }}
      display="button"
      disabled={props.page <= 0}
    >
      Previous page
    </Link>
    <br />
    <Link to="users" params={{ page: "" + (props.page + 1) }} display="button">
      Next page
    </Link>
    <hr />
  </>
);

const UsersEdit = () => (
  <>
    <h1>Edit users</h1>
    <p>If you could edit the users here, here's where that would be. </p>{" "}
  </>
);

const UserProfile = (props: { id: number }) => (
  <>
    <h1>User {props.id} profile</h1>
    <p>hello world!</p>
  </>
);

const App = () => {
  const route = useRoute();
  return (
    <div>
      <b>Route: </b>
      <code>{JSON.stringify(route())}</code>
      <hr />
      <nav class="nav">
        <ul>
          <li>
            <Link to="@@back">Back</Link> / <Link to="@@forward">Forward</Link>
          </li>
          <li>
            <Link nav to="home">
              Home
            </Link>
          </li>
          <li>
            <Link nav navIgnoreParams to="users" params={{ page: "0" }}>
              Users
            </Link>
            <ul>
              <li>
                <Link nav navIgnoreParams to="users.edit">
                  Edit
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link nav to="about">
              About
            </Link>
          </li>
        </ul>
      </nav>
      <hr />
      <Router>
        {{
          about: { render: About },
          home: { render: Home },
          users: {
            render: (p) => (
              <>
                <h1>USERS</h1>
                <hr />
                <div>{p.children}</div>
              </>
            ),
            fallback: (p) => <Users page={Number(p.params.page ?? 0)} />,
            edit: {
              render: () => <UsersEdit />,
            },
            profile: {
              render: (p: { params: { id: string } }) => (
                <UserProfile id={Number(p.params.id)} />
              ),
            },
          },
        }}
      </Router>
    </div>
  );
};

// end interesting parts

render(
  () => (
    <Provider>
      <App />
    </Provider>
  ),
  document.getElementById("app") as any
);
