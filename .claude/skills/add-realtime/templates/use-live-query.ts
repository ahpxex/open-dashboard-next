import {
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

/**
 * `useLiveQuery` — a thin wrapper over TanStack Query's `useQuery` that turns a
 * normal query into a *live* one by polling on an interval, with a pause switch
 * and a `lastUpdated` timestamp for an "updated Ns ago" indicator.
 *
 * It is the simplest way to make any list/metric self-refresh: the data layer
 * (server fn + Repository) is unchanged — only the fetch cadence changes. When
 * `live` is true the query refetches every `intervalMs` (and keeps polling in
 * the background); when false, polling stops and the data freezes until resumed.
 *
 * ── Upgrade path: server push (SSE / websocket) ──────────────────────────────
 * Polling is fine up to a few seconds' latency and trivially portable. For
 * lower latency or high fan-out, push from the server instead and feed the
 * cache from the event — same query key, no `refetchInterval`:
 *
 *   useEffect(() => {
 *     const es = new EventSource("/api/events/orders");
 *     es.onmessage = (e) => {
 *       const row = JSON.parse(e.data);
 *       // Update the cache the live query already reads from:
 *       queryClient.setQueryData(["orders", "list"], (prev) => merge(prev, row));
 *       // …or just invalidate to refetch once:
 *       // queryClient.invalidateQueries({ queryKey: ["orders"] });
 *     };
 *     return () => es.close();
 *   }, [queryClient]);
 *
 * A websocket (`new WebSocket(...)`) follows the same shape — subscribe on
 * mount, write to the cache on each message, close on unmount. The UI binding
 * (this hook's consumers) doesn't change; only the transport does.
 */

export interface LiveQueryControls {
  /** Poll interval in ms when live. Default 5000. */
  intervalMs?: number;
  /** Whether polling is active. Default true. Flip to pause/resume. */
  live?: boolean;
}

/**
 * `UseQueryResult` is a discriminated union, so we intersect rather than extend
 * (an interface can't `extend` a union). The live-only fields ride alongside it.
 */
export type LiveQueryResult<TData, TError> = UseQueryResult<TData, TError> & {
  /** Epoch ms of the most recent successful fetch, or null before the first. */
  lastUpdated: number | null;
  /** Whether polling is currently active. */
  isLive: boolean;
};

export function useLiveQuery<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  { intervalMs = 5000, live = true }: LiveQueryControls = {},
): LiveQueryResult<TData, TError> {
  const query = useQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...options,
    // Poll only while live; keep polling when the tab is backgrounded so the
    // data stays warm. Pausing simply removes the interval.
    refetchInterval: live ? intervalMs : false,
    refetchIntervalInBackground: live,
  });

  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const stamp = query.dataUpdatedAt;
  const seen = useRef(0);
  useEffect(() => {
    if (stamp && stamp !== seen.current) {
      seen.current = stamp;
      setLastUpdated(stamp);
    }
  }, [stamp]);

  return { ...query, lastUpdated, isLive: live };
}
