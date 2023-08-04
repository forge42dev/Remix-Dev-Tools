import clsx from "clsx";

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: "sm" | "md" | "lg";
}

const GAPS = {
  sm: "rdt-gap-1",
  md: "rdt-gap-2",
  lg: "rdt-gap-4",
};

const Stack = ({ gap = "md", className, children, ...props }: StackProps) => {
  return (
    <div
      className={clsx("rdt-flex rdt-flex-col", GAPS[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Stack };
