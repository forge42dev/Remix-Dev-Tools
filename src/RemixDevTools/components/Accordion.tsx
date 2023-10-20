import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import chevronURL from "../icons/chevron-down.svg";

import { cn } from "./util.js";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("rdt-border-b rdt-border-b-gray-500", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="rdt-flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "rdt-flex rdt-flex-1 rdt-items-center rdt-justify-between rdt-py-2 rdt-text-sm rdt-font-medium rdt-transition-all [&[data-state=open]>svg]:rdt-rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <svg className="rdt-text-muted-foreground rdt-h-4 rdt-w-4 rdt-shrink-0 rdt-transition-transform rdt-duration-200">
        <use href={chevronURL + "#icon"} />
      </svg>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "rdt-data-[state=closed]:animate-accordion-up rdt-data-[state=open]:animate-accordion-down rdt-overflow-hidden rdt-text-sm",
      className
    )}
    {...props}
  >
    <div className="rdt-pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
