// import { ReadRoutes } from "./types";
import { Any } from "ts-toolbelt";
import { ReadRoutes, RouteMeta, RouteTreeLike } from "./types";

function Equals<A, B>(_eq: Any.Equals<A, B>) {}

// @dts-jest:pass
Equals<[], []>(1);

// @ts-expect-error
Equals<1, 2>(1);

// @dts-jest:pass
Equals<1, 2>(0);

////////////////////////////////////////////////////////////////////////////////
// ReadRoutes tests

function ReadRoutesEquals<Routes extends RouteTreeLike, Expected>(
  _routes: Any.Equals<ReadRoutes<Routes>, Expected> &
    Any.Extends<ReadRoutes<Routes>, RouteMeta[]>
) {}

// @dts-jest:pass
ReadRoutesEquals<
  [{ name: "home"; path: "/" }],
  [
    {
      nameArray: ["home"];
      name: "home";
      params: {};
      path: "/";
    }
  ]
>(1);

ReadRoutesEquals<
  [{ name: "home"; path: "/" }],
  [
    {
      nameArray: ["home"];
      name: "home";
      params: {};
      path: "/";
    }
  ]
  // @ts-expect-error
>(0);

// @dts-jest:pass
ReadRoutesEquals<
  [{ name: "home"; path: "/" }, { name: "test"; path: "/test" }],
  [
    {
      nameArray: ["home"];
      name: "home";
      params: {};
      path: "/";
    },
    {
      nameArray: ["test"];
      name: "test";
      params: {};
      path: "/test";
    }
  ]
>(1);

// @dts-jest:pass
ReadRoutesEquals<
  [{ name: "home"; path: "/" }, { name: "test"; path: "/test" }],
  [
    {
      nameArray: ["home"];
      name: "home";
      params: {};
      path: "/";
    },
    {
      nameArray: ["test"];
      name: "test";
      params: {};
      path: "/test";
    }
  ]
>(1);

// @dts-jest:pass
ReadRoutesEquals<
  [{ name: "test"; path: "/:id" }],
  [
    {
      nameArray: ["test"];
      name: "test";
      params: { id: string };
      path: "/:id";
    }
  ]
>(1);

// @dts-jest:pass
ReadRoutesEquals<
  [
    {
      name: "test";
      path: "/test";
      children: [{ name: "page"; path: "/:id" }];
    }
  ],
  [
    {
      nameArray: ["test"];
      name: "test";
      params: {};
      path: "/test";
    },
    {
      nameArray: ["test", "page"];
      name: "test.page";
      params: { id: string };
      path: "/test/:id";
    }
  ]
>(1);

// @dts-jest:pass
ReadRoutesEquals<
  [
    {
      name: "home";
      path: "/";
    },
    {
      name: "test";
      path: "/test";
      children: [{ name: "page"; path: "/:id" }];
    }
  ],
  [
    { nameArray: ["home"]; name: "home"; params: {}; path: "/" },
    {
      nameArray: ["test"];
      name: "test";
      params: {};
      path: "/test";
    },
    {
      nameArray: ["test", "page"];
      name: "test.page";
      params: { id: string };
      path: "/test/:id";
    }
  ]
>(1);

// @dts-jest:pass
ReadRoutesEquals<
  [
    {
      name: "home";
      path: "/";
    },
    {
      name: "test";
      path: "/test";
      children: [
        { name: "test"; path: "/test" },
        { name: "page"; path: "/foobar/:id" }
      ];
    }
  ],
  [
    { nameArray: ["home"]; name: "home"; params: {}; path: "/" },
    {
      nameArray: ["test"];
      name: "test";
      params: {};
      path: "/test";
    },
    {
      nameArray: ["test", "test"];
      name: "test.test";
      params: {};
      path: "/test/test";
    },
    {
      nameArray: ["test", "page"];
      name: "test.page";
      params: { id: string };
      path: "/test/foobar/:id";
    }
  ]
>(1);

// @dts-jest:pass
ReadRoutesEquals<
  [
    {
      name: "test";
      path: "/test/:id1/:id2/:id3";
    }
  ],
  [
    {
      nameArray: ["test"];
      name: "test";
      params: { id1: string; id2: string; id3: string };
      path: "/test/:id1/:id2/:id3";
    }
  ]
>(1);

// @dts-jest:pass
ReadRoutesEquals<
  [
    {
      name: "test";
      path: "/test/:id1";
      children: [{ name: "path2"; path: "/:id2" }];
    }
  ],
  [
    {
      nameArray: ["test"];
      name: "test";
      params: { id1: string };
      path: "/test/:id1";
    },
    {
      nameArray: ["test", "path2"];
      name: "test.path2";
      params: { id1: string; id2: string };
      path: "/test/:id1/:id2";
    }
  ]
>(1);
