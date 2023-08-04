import clsx from "clsx";
import { useEffect } from "react";

const isHooked = Symbol("isHooked");
export function useOutletAugment() {
  useEffect(() => {
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
  }, []);
}
