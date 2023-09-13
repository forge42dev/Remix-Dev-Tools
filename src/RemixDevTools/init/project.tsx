import { EntryContext } from "@remix-run/server-runtime";
import clsx from "clsx";

export const InvisibleBoundary = ({ path }: { path: string }) => {
  return <div className={clsx("rdt-invisible rdt-absolute rdt-hidden rdt-h-0 rdt-w-0", path)} />;
};

export const initServer = (context: EntryContext, useRouteBoundaries = false) => {
  if (!useRouteBoundaries) return context;
  return {
    ...context,
    routeModules: Object.entries(context.routeModules).reduce((acc, [key, value]) => {
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
    }, {}),
  };
};

export const initClient = (useRouteBoundaries = false) => {
  if (!useRouteBoundaries) return;
  window.__remixRouteModules = Object.keys(window.__remixRouteModules).reduce((acc, key) => {
    const value = window.__remixRouteModules[key];
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
  }, {});
};
