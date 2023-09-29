import clsx from "clsx";
import { ReactNode } from "react";

export const InfoCard = ({
  children,
  title,
  onClear,
}: {
  children: ReactNode;
  title: string;
  onClear?: () => void;
}) => {
  return (
    <div className="rdt-mb-4 rdt-h-min rdt-rounded-lg rdt-border rdt-border-solid rdt-border-gray-500/40 rdt-px-3 rdt-py-2 rdt-text-base rdt-font-normal rdt-text-white">
      <h6
        className={clsx(
          "rdt-text-left rdt-text-sm",
          onClear ? "rdt-flex rdt-items-center rdt-justify-between rdt-gap-3" : ""
        )}
      >
        {title}
        {onClear && (
          <button
            onClick={onClear}
            className="rdt-cursor-pointer rdt-rounded-lg rdt-bg-red-500 rdt-px-2 rdt-py-1 rdt-text-sm rdt-font-semibold rdt-text-white"
          >
            Clear
          </button>
        )}
      </h6>
      <hr className="-rdt-mx-3 rdt-my-1 rdt-border-gray-500/40" />
      {children}
    </div>
  );
};
