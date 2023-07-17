import clsx from "clsx";

export const TAG_COLORS = {
  GREEN: "rdt-bg-green-500 rdt-text-white",
  BLUE: "rdt-bg-blue-500 rdt-text-white",
  TEAL: "rdt-bg-teal-400 rdt-text-white",
  RED: "rdt-bg-red-500 rdt-text-white",
  PURPLE: "rdt-bg-purple-500 rdt-text-white",
} as const;

interface TagProps {
  color: keyof typeof TAG_COLORS;
  children: string;
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
