import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Label = ({
  className,
  children,
  ...props
}: React.HTMLProps<HTMLLabelElement>) => {
  return (
    <label className={clsx("rdt-block rdt-text-sm", className)} {...props}>
      {children}
    </label>
  );
};

export const Hint = ({ children }: React.HTMLProps<HTMLParagraphElement>) => {
  return <p className="rdt-text-sm rdt-text-gray-500">{children}</p>;
};

const Input = ({ className, name, label, hint, ...props }: InputProps) => {
  return (
    <div className="rdt-flex rdt-w-full rdt-flex-col rdt-gap-1">
      {label && <Label htmlFor={name}>{label}</Label>}
      <input
        name={name}
        id={name}
        className={clsx(
          "rdt-w-full rdt-rounded rdt-border rdt-border-gray-400 rdt-bg-[#121212] rdt-px-2 rdt-py-1 rdt-text-sm",
          className
        )}
        {...props}
      />
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
};

export { Input };
