import { useSubmit, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useMemo } from "react";

const isHooked = Symbol("isHooked");
export function useOutletAugment(shouldAugment: boolean) {
  const submit = useSubmit();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location]
  );
  useEffect(() => {
    if (!shouldAugment) return;
    if (window.__remixRouteModules[isHooked as any]) return;

    window.__remixRouteModules = new Proxy(window.__remixRouteModules, {
      get: function (target, property) {
        if (property === isHooked) return target[property as any];
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

    submit(searchParams, {
      method: "get",
      action: location.pathname,
    });
    // We only want to run this once regardless of the dependencies and we want it to run after the first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
