import { EntryContext } from "@remix-run/server-runtime";
import clsx from "clsx";

export const initRouteBoundariesServer = (context: EntryContext) => {
  return {
    ...context,
    routeModules: Object.entries(context.routeModules).reduce(
      (acc, [key, value]) => {
        if (key === "root") {
          return { ...acc, [key]: value };
        }
        return {
          ...acc,
          [key]: {
            ...value,
            default: () => {
              return (
                <>
                  <div
                    className={clsx(
                      "rdt-invisible rdt-absolute rdt-hidden rdt-h-0 rdt-w-0",
                      key
                    )}
                  />
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

export const initRouteBoundariesClient = () => {
  window.__remixRouteModules = new Proxy(window.__remixRouteModules, {
    get: function (target, property) {
      if (property === "root") return target[property];
      const value = target[property as any];
      if (value?.default && value.default.name !== "hooked") {
        return {
          ...value,
          default: function hooked() {
            return (
              <>
                <div
                  className={clsx(
                    "rdt-invisible rdt-absolute rdt-hidden rdt-h-0 rdt-w-0",
                    property as string
                  )}
                />
                <value.default />
              </>
            );
          },
        };
      }

      return value;
    },
  });
};
