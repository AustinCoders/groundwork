"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectValue({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn("dd__label", className)} {...props} />;
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger data-slot="select-trigger" className={cn("dd__btn", className)} {...props}>
      {children}
      <span className="dd__arrow" aria-hidden="true">
        ▾
      </span>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Content
      data-slot="select-content"
      position="popper"
      side={side}
      align={align}
      sideOffset={sideOffset}
      className={cn("dd__menu", className)}
      style={{ minWidth: "var(--radix-select-trigger-width)" }}
      {...props}
    >
      <SelectPrimitive.Viewport className="dd__viewport">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item data-slot="select-item" className={cn("dd__opt", className)} {...props}>
      <SelectPrimitive.ItemIndicator className="dd__opt-check" aria-hidden="true">
        ✓
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export interface DropdownItem {
  value: string;
  label: string;
  short?: string;
}

export interface DropdownProps {
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  openUp?: boolean;
  compact?: boolean;
  plain?: boolean;
  columns?: number;
}

function Dropdown({ items, value, onChange, ariaLabel, openUp, compact, plain, columns }: DropdownProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("dd", openUp && "dd--up", compact && "dd--compact", plain && "dd--plain", open && "is-open")}>
      <Select value={value} onValueChange={onChange} open={open} onOpenChange={setOpen}>
        <SelectTrigger aria-label={ariaLabel}>
          <SelectValue>{items.find((i) => i.value === value)?.short}</SelectValue>
        </SelectTrigger>
        <SelectContent
          side={openUp ? "top" : "bottom"}
          className={columns ? "dd__menu--grid" : undefined}
          {...(columns ? { style: { "--dd-cols": columns } as React.CSSProperties } : {})}
        >
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Dropdown };
