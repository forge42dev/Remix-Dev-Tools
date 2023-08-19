import { useCallback, useEffect } from "react";
import { ROUTE_BOUNDARY_GRADIENTS } from "../context/rdtReducer";
import { useSettingsContext, useDetachedWindowControls } from "../context/useRDTContext";
import { useAttachListener } from "./useAttachListener";

export const useSetRouteBoundaries = () => {
  const { settings, setSettings } = useSettingsContext();
  const { detachedWindow } = useDetachedWindowControls();
  const applyOrRemoveClasses = useCallback(
    (isHovering?: boolean) => {
      // Overrides the hovering so the classes are force removed if needed
      const hovering = isHovering ?? settings.isHoveringRoute;
      // Classes to apply/remove
      const classes = [
        "rdt-transition-all rdt-duration-400 rdt-rounded rdt-apply-tw",
        ROUTE_BOUNDARY_GRADIENTS[settings.routeBoundaryGradient],
      ].join(" ");

      const isRoot = settings.hoveredRoute === "root";
      // We get all the elements with this class name, the last one is the one we want because strict mode applies 2x divs
      const elements = isRoot
        ? document.getElementsByTagName("body")
        : document.getElementsByClassName(settings.hoveredRoute);

      const element = elements.item(elements.length - 1);

      if (element) {
        // Root has no outlet so we need to use the body, otherwise we get the outlet that is the next sibling of the element
        const outlet = isRoot ? element : (element.nextSibling as HTMLElement);
        for (const c of classes.split(" ")) {
          outlet.classList[hovering ? "add" : "remove"](c);
        }
      }
    },
    [settings.hoveredRoute, settings.isHoveringRoute, settings.routeBoundaryGradient]
  );
  // Mouse left the document => remove classes => set isHovering to false so that detached mode removes as well
  useAttachListener("mouseleave", "document", () => {
    applyOrRemoveClasses();
    if (!detachedWindow) {
      return;
    }
    setSettings({
      isHoveringRoute: false,
    });
  });
  // Mouse is scrolling => remove classes => set isHovering to false so that detached mode removes as well
  useAttachListener("wheel", "window", () => {
    applyOrRemoveClasses(false);
    if (!detachedWindow) {
      return;
    }
    setSettings({
      isHoveringRoute: false,
    });
  });
  // We apply/remove classes on state change which happens in Page tab
  useEffect(() => {
    if (!settings.isHoveringRoute && !settings.hoveredRoute) return;
    applyOrRemoveClasses();
    if (!settings.isHoveringRoute && !detachedWindow) {
      setSettings({
        hoveredRoute: "",
        isHoveringRoute: false,
      });
    }
  }, [
    settings.hoveredRoute,
    settings.isHoveringRoute,
    settings.routeBoundaryGradient,
    applyOrRemoveClasses,
    detachedWindow,
    setSettings,
  ]);
};
