import { useEffect } from "react";
import { InvisibleBoundary } from '../init/project.js';
import { useRDTContext } from '../context/useRDTContext.js';

const isHooked = Symbol("isHooked") as any;

export function useOutletAugment() {
  // TODO Remove once stabilized
  const { state } = useRDTContext();
  useEffect(() => {
    if (!state.useRouteBoundaries) return;
    if (window.__remixRouteModules[isHooked]) return;

    window.__remixRouteModules = new Proxy(window.__remixRouteModules, {
      get: function (target, property) {
        const key = property as any;
        if (property === isHooked) return target[key];
        if (property === "root") return target[property];
        const value = target[key];

        if (value?.default && value.default.name !== "hooked") {
          return {
            ...value,
            default: function hooked() {
              // Does not pollute the DOM with invisible boundaries after the first render
              if (document.getElementsByClassName(key).length) {
                return <value.default />;
              }
              return (
                <>
                  <InvisibleBoundary path={key} />
                  <value.default />
                </>
              );
            },
          };
        }

        return value;
      },
    });
  }, [state.useRouteBoundaries]);
}
