"use client";

import {
  CaretDownIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useMemo, useState } from "react";
import { type AnyForm, FormField, type SelectOption } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ComboboxFieldProps {
  form: AnyForm;
  name: string;
  label?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

/**
 * A searchable single-select bound to a TanStack Form field. Built from a
 * Popover + an inline filter input + a scrollable option list. Selecting an
 * option writes the value to the field and closes the popover.
 */
export function ComboboxField({
  form,
  name,
  label,
  options,
  placeholder = "Select…",
  required,
}: ComboboxFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <FormField form={form} name={name} label={label} required={required}>
      {(field) => {
        const value = (field.state.value as string | undefined) ?? "";
        const selected = options.find((o) => o.value === value);
        return (
          <Popover
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) {
                setQuery("");
                field.handleBlur();
              }
            }}
          >
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  id={name}
                  className="w-full justify-between font-normal"
                >
                  <span
                    className={cn(
                      "truncate",
                      !selected && "text-muted-foreground",
                    )}
                  >
                    {selected ? selected.label : placeholder}
                  </span>
                  <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
                </Button>
              }
            />
            <PopoverContent
              align="start"
              className="w-[var(--anchor-width)] min-w-(--anchor-width) gap-0 p-0"
            >
              <div className="flex items-center gap-2 border-b px-2.5 py-1.5">
                <MagnifyingGlassIcon className="size-4 shrink-0 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {filtered.length === 0 ? (
                  <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No matches
                  </div>
                ) : (
                  filtered.map((option) => {
                    const isActive = option.value === value;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => {
                          field.handleChange(option.value);
                          field.handleBlur();
                          setOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-none px-2 py-1.5 text-left text-xs outline-none hover:bg-accent hover:text-accent-foreground",
                          isActive && "bg-accent text-accent-foreground",
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {isActive ? (
                          <CheckIcon className="size-4 shrink-0" />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        );
      }}
    </FormField>
  );
}
