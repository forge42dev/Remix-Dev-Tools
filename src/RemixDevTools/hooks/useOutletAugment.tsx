import { useEffect } from "react";
import { InvisibleBoundary } from "../init/project";

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
                  <InvisibleBoundary path={property as any} />
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
