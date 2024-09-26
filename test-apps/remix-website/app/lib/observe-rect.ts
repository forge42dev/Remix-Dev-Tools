const RECT_PROPS = [
  "bottom",
  "height",
  "left",
  "right",
  "top",
  "width",
] as const;

let observedNodes = new Map<Element, RectProps>();
let rafId: number;

function getRect(node: Element): DOMRect {
  return node.getBoundingClientRect();
}

function run() {
  let changedStates: RectProps[] = [];
  observedNodes.forEach((state, node) => {
    let newRect = getRect(node);
    if (rectChanged(newRect, state.rect)) {
      state.rect = newRect;
      changedStates.push(state);
    }
  });

  changedStates.forEach((state) => {
    state.callbacks.forEach((cb) => cb(state.rect));
  });

  rafId = window.requestAnimationFrame(run);
}

function observeRect(node: Element, onChange: (rect: DOMRect) => void) {
  return {
    observe() {
      let wasEmpty = observedNodes.size === 0;
      if (observedNodes.has(node)) {
        observedNodes.get(node)!.callbacks.push(onChange);
      } else {
        observedNodes.set(node, {
          rect: undefined,
          hasRectChanged: false,
          callbacks: [onChange],
        });
      }
      if (wasEmpty) run();
    },

    unobserve() {
      let state = observedNodes.get(node);
      if (state) {
        // Remove the callback
        let index = state.callbacks.indexOf(onChange);
        if (index >= 0) state.callbacks.splice(index, 1);

        // Remove the node reference
        if (!state.callbacks.length) observedNodes.delete(node);

        // Stop the loop
        if (!observedNodes.size) cancelAnimationFrame(rafId);
      }
    },
  };
}

function rectChanged(a: DOMRect, b: DOMRect | undefined) {
  return RECT_PROPS.some((prop) => a[prop] !== b?.[prop]);
}

export { getRect, observeRect, rectChanged };

export interface RectProps {
  rect: DOMRect | undefined;
  hasRectChanged: boolean;
  callbacks: Function[];
}
