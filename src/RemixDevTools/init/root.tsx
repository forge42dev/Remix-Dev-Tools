import { RemixDevTools, RemixDevToolsProps } from "../RemixDevTools.js";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
let hydrating = true;

function useHydrated() {
  const [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}
export const defineClientConfig = (config: RemixDevToolsProps) => config;

export const withDevTools = (Component: any, config?: RemixDevToolsProps) => () => {
  const hydrated = useHydrated();
  if (!hydrated) return <Component />;

  return (
    <>
      <Component />
      {createPortal(<RemixDevTools {...config} />, document.body)}
    </>
  );
};

export const withViteDevTools = (Component: any, config?: RemixDevToolsProps) => () => {
  function AppWithDevTools(props: any) {
    if (typeof document === "undefined") return <Component />;
    return (
      <>
        <Component {...props} />
        {createPortal(<RemixDevTools {...config} />, document.body)}
      </>
    );
  }
  return AppWithDevTools;
};
//export const InjectedStyles = () => {
// const blob = new Blob([css], { type: "text/css" });
// const url = URL.createObjectURL(blob);

// useEffect(() => () => URL.revokeObjectURL(url), [url]);
// const cssContent = css; // Assuming css is a string

// Split the css content into chunks (adjust chunkSize as needed)
// const chunkSize = 2000;
//const cssChunks = [];

//let currentChunk = "";
//let currentIndex = 0;

//for (let i = 0; i < cssContent.length; i++) {
//  currentChunk += cssContent[i];

//  if (cssContent[i] === "}" && i - currentIndex >= chunkSize) {
//    cssChunks.push(currentChunk);
//    currentChunk = "";
//    currentIndex = i + 1;
//  }
// }

//if (currentChunk !== "") {
//   cssChunks.push(currentChunk);
// }

// return <style dangerouslySetInnerHTML={{ __html: css }} />;
//};
