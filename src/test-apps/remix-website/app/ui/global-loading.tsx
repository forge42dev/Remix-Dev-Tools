import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@remix-run/react";
import cx from "clsx";

export function GlobalLoading() {
  let transition = useNavigation();
  let active = transition.state !== "idle";

  let ref = useRef<HTMLDivElement>(null);
  let [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    Promise.allSettled(
      ref.current.getAnimations().map(({ finished }) => finished),
    ).then(() => {
      if (!active) setAnimating(false);
    });

    if (active) {
      let id = setTimeout(() => setAnimating(true), 100);
      return () => clearTimeout(id);
    }
  }, [active]);

  return (
    <div
      role="progressbar"
      aria-hidden={!active}
      aria-valuetext={active ? "Loading" : undefined}
      className="fixed inset-x-0 left-0 top-0 z-50 h-1 animate-pulse"
    >
      <div
        ref={ref}
        className={cx(
          "h-full bg-gradient-to-r from-blue-brand to-aqua-brand transition-all duration-500 ease-in-out",
          transition.state === "idle" &&
            (animating ? "w-full" : "w-0 opacity-0 transition-none"),
          transition.state === "submitting" && "w-4/12",
          transition.state === "loading" && "w-10/12",
        )}
      />
    </div>
  );
}
