import * as React from "react";
import { Link } from "~/ui/link";

export const outlinePrimaryButtonLinkClass =
  "inline-flex items-center justify-center xl:text-xl h-14 xl:h-16 t box-border px-8 rounded bg-transparent text-white border-current hover:border-blue-brand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-blue-200 focus:ring-opacity-80 font-semibold border-2";

export const outlineSecondaryButtonLinkClass =
  "inline-flex items-center justify-center xl:text-xl h-14 xl:h-16 t box-border px-8 rounded bg-transparent text-white border-current hover:border-pink-brand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-blue-200 focus:ring-opacity-80 font-semibold border-2";

export function OutlineButtonLink({
  to,
  children,
  className,
  prefetch = "intent",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: "intent" | "render";
}) {
  return (
    <Link
      to={to}
      prefetch={prefetch}
      x-comp="OutlineButtonLink"
      className={`${outlinePrimaryButtonLinkClass} ${className}`}
      children={children}
    />
  );
}

export const baseButtonLinkClass =
  "inline-flex items-center justify-center xl:text-xl h-14 xl:h-16 box-border px-8 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent font-semibold";

export const primaryButtonLinkClass = `${baseButtonLinkClass} bg-blue-brand text-white hover:bg-blue-600 focus:ring-blue-200 transition-colors duration-200`;

export const secondaryButtonLinkClass = `${baseButtonLinkClass} bg-pink-brand text-white hover:bg-pink-600 focus:ring-blue-200 transition-colors duration-200`;

export function PrimaryButtonLink({
  to,
  children,
  className,
  prefetch = "intent",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: "intent" | "render";
}) {
  return (
    <Link
      x-comp="PrimaryButtonLink"
      to={to}
      prefetch={prefetch}
      className={`${primaryButtonLinkClass} ${className}`}
      children={children}
    />
  );
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button">
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      x-comp="Button"
      className={
        "box-border inline-flex items-center justify-center rounded bg-blue-brand px-8 py-4 font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:ring-offset-transparent " +
        className
      }
      type={props.type}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithRef<"input">
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      x-comp="Input"
      className={
        "box-border inline-block rounded border border-solid border-gray-300 bg-white px-5 py-4 text-gray-900 dark:border-none dark:bg-gray-800 dark:text-white " +
        className
      }
      title={props.title}
      {...props}
    />
  );
});
Input.displayName = "Input";
