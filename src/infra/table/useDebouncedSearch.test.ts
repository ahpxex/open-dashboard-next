import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedSearch } from "./useDebouncedSearch";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedSearch", () => {
  it("exposes the local value immediately on change", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch("", onChange, 300));

    act(() => result.current[1]("g"));
    expect(result.current[0]).toBe("g");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("pushes upstream only once after typing settles", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch("", onChange, 300));

    act(() => result.current[1]("g"));
    act(() => result.current[1]("go"));
    act(() => result.current[1]("gold"));
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current[0]).toBe("gold");

    act(() => vi.advanceTimersByTime(300));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("gold");
  });

  it("re-syncs the local value when the upstream value changes", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedSearch(value, onChange, 300),
      { initialProps: { value: "" } },
    );

    rerender({ value: "external" });
    expect(result.current[0]).toBe("external");
  });
});
