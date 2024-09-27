import { useCallback, useEffect } from "react";
import { ROUTE_BOUNDARY_GRADIENTS } from "../context/rdtReducer.js";
import { useSettingsContext, useDetachedWindowControls } from "../context/useRDTContext.js";
import { useAttachListener } from "./useAttachListener.js";
import { useMatches } from "@remix-run/react";
import { ROUTE_CLASS } from "./useBorderedRoutes.js";

export const useSetRouteBoundaries = () => {
  const matches = useMatches();
  const { settings, setSettings } = useSettingsContext();
  const { detachedWindow } = useDetachedWindowControls();
  const applyOrRemoveClasses = useCallback(
    (isHovering?: boolean) => {
      // Overrides the hovering so the classes are force removed if needed
      const hovering = isHovering ?? settings.isHoveringRoute;
      // Classes to apply/remove
      const classes = [
        "transition-all duration-200 rounded-lg apply-tw",
        ROUTE_BOUNDARY_GRADIENTS[settings.routeBoundaryGradient],
      ].join(" ");

      const isRoot = settings.hoveredRoute === "root";
      // We get all the elements with this class name, the last one is the one we want because strict mode applies 2x divs
      const elements = isRoot ? document.getElementsByTagName("body") : document.getElementsByClassName(ROUTE_CLASS);

      const element = isRoot
        ? elements.item(elements.length - 1)
        : elements.item(matches.length - 1 - parseInt(settings.hoveredRoute));

      if (element) {
        // Root has no outlet so we need to use the body, otherwise we get the outlet that is the next sibling of the element
        const outlet = element;
        for (const c of classes.split(" ")) {
          outlet.classList[hovering ? "add" : "remove"](c);
        }
      }
      if(element?.parentElement){
        element.parentElement.classList[hovering ? "add" : "remove"]("remix-dev-tools");
      }
    },
    [settings.hoveredRoute, settings.isHoveringRoute, settings.routeBoundaryGradient, matches.length]
  );
  // Mouse left the document => remove classes => set isHovering to false so that detached mode removes as well
  useAttachListener("mouseleave", "document", () => {
    if(settings.showRouteBoundariesOn=== "click"){
      return
    }
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
    if(settings.showRouteBoundariesOn=== "click"){
      return
    }
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
