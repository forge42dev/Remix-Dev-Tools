interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
  children: React.ReactNode;
  value?: boolean;
  hint?: string;
}

const Checkbox = ({
  onChange,
  id,
  children,
  value,
  hint,
  ...props
}: CheckboxProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 py-1">
        <input
          value={value ? "checked" : undefined}
          checked={value}
          onChange={onChange}
          id={id}
          type="checkbox"
          {...props}
        ></input>
        <label className="text-md cursor-pointer" htmlFor={id}>
          {children}
        </label>
      </div>
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
};

export { Checkbox };
