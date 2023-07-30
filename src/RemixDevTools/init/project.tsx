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
