import { useState, type Dispatch, type SetStateAction } from "react";

// React's officially-recommended way to reset/sync local state when a prop
// changes, without the extra render + flicker (and the react-hooks lint
// rule's objection) that a useEffect-based sync would trigger — see
// https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
// Every admin board uses this for its server-seeded list state so a
// background refresh (AdminAutoRefresh calling router.refresh()) actually
// reaches it — useState's initial value is otherwise only ever read once.
export function useSyncedState<T>(value: T): [T, Dispatch<SetStateAction<T>>] {
  const [prevValue, setPrevValue] = useState(value);
  const [state, setState] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setState(value);
  }

  return [state, setState];
}
