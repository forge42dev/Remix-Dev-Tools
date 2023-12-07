import clsx from "clsx";
import { ReactNode } from "react";

export const TAG_COLORS = {
  GREEN: "rdt-border-green-500 rdt-border rdt-border-solid rdt-text-white",
  BLUE: "rdt-border-blue-500 rdt-border rdt-border-solid rdt-text-white",
  TEAL: "rdt-border-teal-400 rdt-border rdt-border-solid rdt-text-white",
  RED: "rdt-border-red-500 rdt-border rdt-border-solid rdt-text-white",
  PURPLE: "rdt-border-purple-500 rdt-border rdt-border-solid rdt-text-white",
} as const;

interface TagProps {
  color: keyof typeof TAG_COLORS;
  children: ReactNode;
  className?: string;
}

const Tag = ({ color, children, className }: TagProps) => {
  return (
    <span
      className={clsx(
        "rdt-flex rdt-items-center rdt-rounded rdt-px-2.5 rdt-py-0.5 rdt-text-sm rdt-font-medium",
        className,
        TAG_COLORS[color]
      )}
    >
      {children}
    </span>
  );
};

export { Tag };
