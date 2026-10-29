import { useCallback, useEffect, useRef, useState } from 'react';

// Runs an async function and tracks loading / error / data.
// reload(true) refreshes quietly without showing the loading state.
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);
  const quietRef = useRef(false);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let active = true;
    if (!quietRef.current) setState((s) => ({ ...s, loading: true, error: null }));
    quietRef.current = false;
    fetcherRef.current()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((err) =>
        active && setState({ data: null, loading: false, error: err.message || 'Something went wrong.' })
      );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback((quiet = false) => {
    quietRef.current = quiet === true;
    setTick((t) => t + 1);
  }, []);

  return { ...state, reload };
}
