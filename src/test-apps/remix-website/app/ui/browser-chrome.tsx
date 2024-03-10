import * as React from "react";

export function BrowserChrome({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-2 max-h-[75vh] select-none overflow-hidden  rounded bg-gray-700 shadow-md md:mx-4 md:rounded-lg lg:mx-auto lg:max-w-4xl">
      <URLBar url={url} />
      <div className="px-2 pb-2 pt-1 md:px-4 md:pb-4 md:pt-2">{children}</div>
    </div>
  );
}

function URLBar({ url }: { url: string }) {
  return (
    <div className="flex items-center justify-center px-1 pb-0 pt-1 md:px-2 md:pt-2">
      <div className="relative flex w-2/3 items-center rounded-md bg-gray-600 px-2 py-1 text-gray-100 md:px-3 md:py-1">
        <span className="text-[length:10px] md:text-sm">{url}</span>
        <Refresh className="absolute right-1 h-4 w-4 md:h-5 md:w-5" />
      </div>
      <div className="absolute left-1 flex gap-1 p-2 md:left-2 md:gap-2">
        <Circle />
        <Circle />
        <Circle />
      </div>
    </div>
  );
}

function Circle() {
  return <div className="h-2 w-2 rounded-full bg-gray-400 md:h-3 md:w-3" />;
}

function Refresh({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 7 7"
    >
      <path
        fill="#fff"
        fillOpacity="0.8"
        d="M5.088 4.004l-.125.126.125.125.126-.125-.126-.126zm-1.073-.822l.948.948.251-.252-.948-.948-.251.252zm1.2.948l.947-.948-.251-.252-.948.948.251.252z"
      ></path>
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeOpacity="0.8"
        strokeWidth="0.355"
        d="M4.26 4.966a1.659 1.659 0 11.829-1.436"
      ></path>
    </svg>
  );
}
