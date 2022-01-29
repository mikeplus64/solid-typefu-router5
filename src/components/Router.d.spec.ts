import { Any } from "ts-toolbelt";
import {
  ReadRoutes,
  RouterFallbackRenderFn,
  RouterRenderFn,
  RouterRenderNode,
  RouteTreeLike,
} from "../types";
import { RSM } from "./Router";

function Equals<A, B>(_eq: Any.Equals<Any.Compute<A>, Any.Compute<B>>) {}

// @dts-jest:pass
Equals<null, null>(1);

// @dts-jest:pass
Equals<
  RouterRenderNode,
  {
    render?: RouterRenderFn;
    fallback?: RouterFallbackRenderFn;
  }
>(1);

// @dts-jest:pass
Equals<
  RouterRenderNode,
  RouterRenderNode & {
    render?: RouterRenderFn;
    fallback?: RouterFallbackRenderFn;
  }
>(1);

////////////////////////////////////////////////////////////////////////////////

function RSMEquals<A extends RouteTreeLike, B>(
  _eq: Any.Equals<Any.Compute<RSM<ReadRoutes<A>>>, Any.Compute<B>>
) {}

// @dts-jest:pass
RSMEquals<
  [{ name: "test"; path: "/test" }],
  {
    test?: RouterRenderNode;
  } & RouterRenderNode
>(1);

// @dts-jest:pass
RSMEquals<
  [{ name: "asdf"; path: "/asdf" }, { name: "fdsa"; path: "/fdsa" }],
  {
    asdf?: RouterRenderNode;
    fdsa?: RouterRenderNode;
  } & RouterRenderNode
>(1);

// @dts-jest:pass
RSMEquals<
  [
    { name: "asdf"; path: "/asdf" },
    { name: "fdsa"; path: "/fdsa" },
    { name: "qwer"; path: "/qwer" },
    { name: "hjkl"; path: "/hjkl" }
  ],
  {
    asdf?: RouterRenderNode;
    fdsa?: RouterRenderNode;
    qwer?: RouterRenderNode;
    hjkl?: RouterRenderNode;
  } & RouterRenderNode
>(1);

// @dts-jest:pass
RSMEquals<
  [
    { name: "asdf"; path: "/asdf"; children: [{ name: "fdsa"; path: "/fdsa" }] }
  ],
  {
    render?: RouterRenderFn;
    fallback?: RouterFallbackRenderFn;
    asdf?: {
      render?: RouterRenderFn;
      fallback?: RouterFallbackRenderFn;
      fdsa?: RouterRenderNode;
    };
  }
>(1);

// // @dts-jest:pass
// RSMEquals<
//   [
//     {
//       name: "asdf";
//       path: "/asdf";
//       children: [
//         {
//           name: "fdsa";
//           path: "/fdsa";
//           children: [{ name: "qwerty"; path: "/qwerty" }];
//         }
//       ];
//     }
//   ],
//   {
//     render?: RouterRenderFn;
//     fallback?: RouterFallbackRenderFn;
//     asdf?: {
//       render?: RouterRenderFn;
//       fallback?: RouterFallbackRenderFn;
//       fdsa?: {
//         render?: RouterRenderFn;
//         fallback?: RouterFallbackRenderFn;
//         qwerty?: {
//           render?: RouterRenderFn;
//           fallback?: RouterFallbackRenderFn;
//         };
//       };
//     };
//   }
// >(1);
//
// Fails due to TS weirdness

// @dts-jest:pass
RSMEquals<
  [
    {
      name: "asdf";
      path: "/asdf/:id";
    }
  ],
  {
    render?: RouterRenderFn;
    fallback?: RouterFallbackRenderFn;
    asdf?: {
      render?: RouterRenderFn<{ id: string }>;
      fallback?: RouterFallbackRenderFn<{ id: string }>;
    };
  }
>(1);

// @dts-jest:pass
RSMEquals<
  [
    {
      name: "asdf";
      path: "/asdf/:id?page";
    }
  ],
  {
    render?: RouterRenderFn;
    fallback?: RouterFallbackRenderFn;
    asdf?: {
      render?: RouterRenderFn<{ id: string; page?: string }>;
      fallback?: RouterFallbackRenderFn<{ id: string; page?: string }>;
    };
  }
>(1);

// @dts-jest:pass
RSMEquals<
  [
    {
      name: "asdf";
      path: "/asdf/:id?page";
      children: [
        {
          name: "test";
          path: "/:test";
        }
      ];
    }
  ],
  {
    render?: RouterRenderFn;
    fallback?: RouterFallbackRenderFn;
    asdf?: {
      render?: RouterRenderFn<{ id: string; page?: string }>;
      fallback?: RouterFallbackRenderFn<{ id: string; page?: string }>;
      test?: {
        render?: RouterRenderFn<{ id: string; page?: string; test: string }>;
        fallback?: RouterFallbackRenderFn<{
          id: string;
          page?: string;
          test: string;
        }>;
      };
    };
  }
>(1);
