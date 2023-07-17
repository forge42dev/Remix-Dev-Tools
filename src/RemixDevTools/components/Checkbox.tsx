interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
  children: React.ReactNode;
  value?: boolean;
}

const Checkbox = ({
  onChange,
  id,
  children,
  value,
  ...props
}: CheckboxProps) => {
  return (
    <div className="rdt-flex rdt-items-center rdt-gap-2 rdt-py-1">
      <input
        value={value ? "checked" : undefined}
        onChange={onChange}
        id={id}
        type="checkbox"
        {...props}
      ></input>
      <label className="rdt-text-md rdt-cursor-pointer" htmlFor={id}>
        {children}
      </label>
    </div>
  );
};

export { Checkbox };
