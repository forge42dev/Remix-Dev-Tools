import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { Stack } from "./Stack";
import { Hint, Label } from "./Input";
import { cn } from "./util";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "rdt-border-input rdt-ring-offset-background placeholder:rdt-text-muted-foreground focus:rdt-ring-ring rdt-flex rdt-h-8 rdt-w-full rdt-items-center rdt-justify-between rdt-rounded-md rdt-border rdt-border-gray-400 rdt-bg-[#121212] rdt-px-3 rdt-py-2 rdt-text-sm focus:rdt-outline-none focus:rdt-ring-2 focus:rdt-ring-offset-2 disabled:rdt-cursor-not-allowed disabled:rdt-opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="rdt-h-4 rdt-w-4 rdt-opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "rdt-relative rdt-z-[9999] rdt-min-w-[8rem] rdt-overflow-hidden rdt-rounded-md rdt-border rdt-border-solid rdt-border-[#121212] rdt-bg-popover rdt-text-popover-foreground rdt-shadow-md data-[state=open]:rdt-animate-in data-[state=closed]:rdt-animate-out data-[state=closed]:rdt-fade-out-0 data-[state=open]:rdt-fade-in-0 data-[state=closed]:rdt-zoom-out-95 data-[state=open]:rdt-zoom-in-95 data-[side=bottom]:rdt-slide-in-from-top-2 data-[side=left]:rdt-slide-in-from-right-2 data-[side=right]:rdt-slide-in-from-left-2 data-[side=top]:rdt-slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:rdt-translate-y-1 data-[side=left]:-rdt-translate-x-1 data-[side=right]:rdt-translate-x-1 data-[side=top]:-rdt-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "rdt-border rdt-border-gray-500 rdt-p-1",
          position === "popper" &&
            "rdt-h-[var(--radix-select-trigger-height)] rdt-w-full rdt-min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "rdt-py-1.5 rdt-pl-8 rdt-pr-2 rdt-font-sans rdt-text-sm",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "focus:rdt-text-accent-foreground rdt-relative rdt-flex rdt-w-full rdt-cursor-default rdt-select-none rdt-items-center rdt-rounded-sm rdt-py-1.5 rdt-pl-8 rdt-pr-2 rdt-font-sans rdt-text-sm rdt-outline-none hover:rdt-cursor-pointer hover:rdt-bg-[#121212] focus:rdt-bg-[#121212] data-[disabled]:rdt-pointer-events-none data-[disabled]:rdt-opacity-50",
      className
    )}
    {...props}
  >
    <span className="rdt-absolute rdt-left-2 rdt-flex rdt-h-3.5 rdt-w-3.5 rdt-items-center rdt-justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="rdt-h-4 rdt-w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("rdt-bg-grey-600 -rdt-mx-1 rdt-my-1 rdt-h-px", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

const SelectWithOptions = <T extends string>({
  placeholder,
  label,
  options,
  onSelect,
  hint,
  value,
}: {
  placeholder?: string;
  value?: T;
  label?: string;
  hint?: string;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
}) => {
  return (
    <Stack gap="sm">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onSelect}>
        <SelectTrigger className="rdt-w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {hint && <Hint>{hint}</Hint>}
    </Stack>
  );
};

export { SelectWithOptions };
