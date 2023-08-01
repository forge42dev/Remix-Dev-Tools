import { EntryContext } from "@remix-run/server-runtime";
import clsx from "clsx";
import { RemixDevTools, RemixDevToolsProps } from "../RemixDevTools";
import ReactDOM from "react-dom";

const InvisibleBoundary = ({ path }: { path: string }) => {
  return (
    <div
      className={clsx(
        "rdt-invisible rdt-absolute rdt-hidden rdt-h-0 rdt-w-0",
        path
      )}
    />
  );
};

export const initServer = (context: EntryContext) => {
  return {
    ...context,
    routeModules: Object.entries(context.routeModules).reduce(
      (acc, [key, value]) => {
        if (key === "root") {
          return {
            ...acc,
            [key]: value,
          };
        }
        return {
          ...acc,
          [key]: {
            ...value,
            default: () => {
              return (
                <>
                  <InvisibleBoundary path={key} />
                  <value.default />
                </>
              );
            },
          },
        };
      },
      {}
    ),
  };
};

export const initClient = (props?: RemixDevToolsProps) => {
  window.__remixRouteModules = Object.keys(window.__remixRouteModules).reduce(
    (acc, key) => {
      const value = window.__remixRouteModules[key];
      if (key === "root") {
        return {
          ...acc,
          [key]: {
            ...value,
            default: () => {
              return (
                <>
                  {ReactDOM.createPortal(
                    <RemixDevTools {...props} />,
                    document.body
                  )}
                  <value.default />
                </>
              );
            },
          },
        };
      }

      return {
        ...acc,
        [key]: {
          ...value,
          default: () => {
            return (
              <>
                <InvisibleBoundary path={key} />
                <value.default />
              </>
            );
          },
        },
      };
    },
    {}
  );
};

// Graveyard of failed attempts
/*  const proxy = new Proxy(window.__remixRouteModules, {
    get: function (target, property) {
      const value = target[property as any];
      if (property === "root") {
        console.log("hi2", property, RemixDevTools);
        return {
          ...value,

          default: function hooked() {
            return (
              <>
                {ReactDOM.createPortal(
                  <RemixDevTools {...props} />,
                  document.body
                )}
                <value.default />
              </>
            );
          },
        };
      }
      if (value?.default && value.default.name !== "hooked") {
        return {
          ...value,
          default: function hooked() {
            return (
              <>
                <InvisibleBoundary path={property as string} />
                <value.default />
              </>
            );
          },
        };
      }

      return value;
    },
  });
  Object.defineProperty(window, "__remixRouteModules", {
    get: function () {
      console.log("udje?", proxy);
      return proxy;
    },
  }); */

/*  window = new Proxy(window, {
    set: function (obj, property, val) {
      if (property === "__remixRouteModules") {
        return Reflect.set(
          obj,
          property,
          new Proxy(val, {
            get: function (target, property) {
              const value = target[property as any];
              console.log("hi3", property);
              if (property === "root") {
                return {
                  ...value,
                  default: function hooked() {
                    return (
                      <>
                        {ReactDOM.createPortal(
                          <RemixDevTools {...props} />,
                          document.body
                        )}
                        <value.default />
                      </>
                    );
                  },
                };
              }
              if (value?.default && value.default.name !== "hooked") {
                return {
                  ...value,
                  default: function hooked() {
                    return (
                      <>
                        <InvisibleBoundary path={property as string} />
                        <value.default />
                      </>
                    );
                  },
                };
              }

              return value;
            },
          })
        );
      }
      return Reflect.set(obj, property, val);
    },
    get: function (target, property) {
      if (property === "__remixRouteModules") {
        const remixRouteModules = target[
          property as any
        ] as any as RouteModules;
        return new Proxy(remixRouteModules, {
          set: function (obj, property, val) {
            const value = obj[property as any];
            if (property === "root") {
              return Reflect.set(obj, property, {
                ...value,
                default: function hooked() {
                  return (
                    <>
                      {ReactDOM.createPortal(
                        <RemixDevTools {...props} />,
                        document.body
                      )}
                      <value.default />
                    </>
                  );
                },
              });
            }
            if (value?.default && value.default.name !== "hooked") {
              return Reflect.set(obj, property, {
                ...value,
                default: function hooked() {
                  return (
                    <>
                      <InvisibleBoundary path={property as string} />
                      <value.default />
                    </>
                  );
                },
              });
            }
            return Reflect.set(obj, property, val);
          },
          get: function (target, property) {
            const value = target[property as any];
            console.log("hi3", property);
            if (property === "root") {
              return {
                ...value,
                default: function hooked() {
                  return (
                    <>
                      {ReactDOM.createPortal(
                        <RemixDevTools {...props} />,
                        document.body
                      )}
                      <value.default />
                    </>
                  );
                },
              };
            }
            if (value?.default && value.default.name !== "hooked") {
              return {
                ...value,
                default: function hooked() {
                  return (
                    <>
                      <InvisibleBoundary path={property as string} />
                      <value.default />
                    </>
                  );
                },
              };
            }

            return value;
          },
        });
      }
      return target[property as any];
    },
  }); */

/*   const observer = new MutationObserver((e) => {
    window.__remixRouteModules = Object.keys(window.__remixRouteModules).reduce(
      (acc, key) => {
        const value = window.__remixRouteModules[key];
        if (key === "root") {
          return {
            ...acc,
            [key]: {
              ...value,
              default: () => {
                return (
                  <>
                    {ReactDOM.createPortal(
                      <RemixDevTools {...props} />,
                      document.body
                    )}
                    <value.default />
                  </>
                );
              },
            },
          };
        }

        return {
          ...acc,
          [key]: {
            ...value,
            default: () => {
              return (
                <>
                  <InvisibleBoundary path={key} />
                  <value.default />
                </>
              );
            },
          },
        };
      },
      {}
    );
  }); */
/* new window.MutationObserver(() => {
    window.__remixRouteModules = Object.keys(window.__remixRouteModules).reduce(
      (acc, key) => {
        const value = window.__remixRouteModules[key];
        if (key === "root") {
          return {
            ...acc,
            [key]: {
              ...value,
              default: () => {
                return (
                  <>
                    {ReactDOM.createPortal(
                      <RemixDevTools {...props} />,
                      document.body
                    )}
                    <value.default />
                  </>
                );
              },
            },
          };
        }

        return {
          ...acc,
          [key]: {
            ...value,
            default: () => {
              return (
                <>
                  <InvisibleBoundary path={key} />
                  <value.default />
                </>
              );
            },
          },
        };
      },
      {}
    );
  }); */
