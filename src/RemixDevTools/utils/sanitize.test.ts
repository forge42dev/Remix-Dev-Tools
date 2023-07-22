import { convertRemixPathToUrl } from "./sanitize";

describe("convertRemixPathToUrl", () => {
  it('should return "/" when given a route with no parent', () => {
    const routes = {
      root: {
        id: "root",
        path: "",
      },
    };

    const route = routes.root;
    const result = convertRemixPathToUrl(routes as any, route);
    expect(result).toBe("/");
  });

  it("should return the correct URL for a nested route", () => {
    const routes = {
      root: {
        id: "root",
        path: "",
      },
      parentRoute: {
        id: "parentRoute",
        parentId: "root",
        path: "parent",
      },
      childRoute: {
        id: "childRoute",
        parentId: "parentRoute",
        path: "child",
      },
    };

    const route = routes.childRoute;
    const result = convertRemixPathToUrl(routes, route);
    expect(result).toBe("parent/child");
  });

  it("should return the correct URL for a route with a parent that does not exist in the routes object", () => {
    const routes = {
      root: {
        id: "root",
        path: "",
      },
      childRoute: {
        id: "childRoute",
        parentId: "nonExistentParent",
        path: "child",
      },
    };

    const route = routes.childRoute;
    const result = convertRemixPathToUrl(routes, route);
    expect(result).toBe("child");
  });

  it("should return the correct URL for a route with a parent that has an empty path", () => {
    const routes = {
      root: {
        id: "root",
        path: "",
      },
      parentRoute: {
        id: "parentRoute",
        parentId: "root",
        path: "",
      },
      childRoute: {
        id: "childRoute",
        parentId: "parentRoute",
        path: "child",
      },
    };

    const route = routes.childRoute;
    const result = convertRemixPathToUrl(routes, route);
    expect(result).toBe("child");
  });
});
