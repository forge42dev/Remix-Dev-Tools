import clsx from "clsx";

const Input = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={clsx(
        "rdt-w-full rdt-rounded rdt-border rdt-border-gray-400 rdt-bg-[#121212] rdt-px-2 rdt-py-1 rdt-text-sm",
        className
      )}
      {...props}
    />
  );
};

export { Input };
