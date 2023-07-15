import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      className={clsx(
        "rdt-border-gray-400 rdt-w-full rdt-border rdt-bg-[#121212] rdt-rounded rdt-px-2 rdt-py-1 rdt-text-sm",
        className
      )}
      {...props}
    />
  );
};

export { Input };
