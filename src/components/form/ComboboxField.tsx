"use client";

import {
  CaretDownIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  // Index of the keyboard-highlighted option within `filtered` (the
  // aria-activedescendant target). Selection (the chosen value) is separate.
  const [activeIndex, setActiveIndex] = useState(0);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Keep the highlight in range as the filter narrows, and scroll it into view.
  useEffect(() => {
    if (activeIndex > filtered.length - 1) setActiveIndex(0);
  }, [filtered.length, activeIndex]);
  useEffect(() => {
    if (open)
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const listboxId = `${name}-listbox`;
  const optionId = (index: number) => `${name}-option-${index}`;

  return (
    <FormField form={form} name={name} label={label} required={required}>
      {(field) => {
        const value = (field.state.value as string | undefined) ?? "";
        const selected = options.find((o) => o.value === value);

        const select = (optionValue: string) => {
          field.handleChange(optionValue);
          field.handleBlur();
          setOpen(false);
          setQuery("");
        };

        const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            const option = filtered[activeIndex];
            if (option) select(option.value);
          }
          // Escape / Tab fall through to the Popover (closes / moves focus).
        };

        return (
          <Popover
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (next) {
                // Highlight the current selection (or the top) on open.
                const i = options.findIndex((o) => o.value === value);
                setActiveIndex(i >= 0 ? i : 0);
              } else {
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
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onInputKeyDown}
                  placeholder="Search…"
                  role="combobox"
                  aria-expanded={open}
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                  aria-activedescendant={
                    filtered[activeIndex] ? optionId(activeIndex) : undefined
                  }
                  className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div
                id={listboxId}
                role="listbox"
                className="max-h-60 overflow-y-auto p-1"
              >
                {filtered.length === 0 ? (
                  <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No matches
                  </div>
                ) : (
                  filtered.map((option, index) => {
                    const isSelected = option.value === value;
                    const isActive = index === activeIndex;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        id={optionId(index)}
                        role="option"
                        aria-selected={isSelected}
                        ref={(el) => {
                          optionRefs.current[index] = el;
                        }}
                        onClick={() => select(option.value)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-none px-2 py-1.5 text-left text-xs outline-none",
                          isActive && "bg-accent text-accent-foreground",
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {isSelected ? (
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
