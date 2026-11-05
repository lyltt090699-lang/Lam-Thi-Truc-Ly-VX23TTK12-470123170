import { useEffect, useRef, useState } from "react";
import { ApiError } from "../api/client";

export type RemoteState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "missing"; message: string }
  | { status: "error"; message: string };

export function useRemote<T>(load: () => Promise<T>, key: string) {
  const loadRef = useRef(load);
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${key}:${attempt}`;
  const [seenKey, setSeenKey] = useState(requestKey);
  const [state, setState] = useState<RemoteState<T>>({ status: "loading" });

  useEffect(() => {
    loadRef.current = load;
  });

  if (seenKey !== requestKey) {
    setSeenKey(requestKey);
    setState({ status: "loading" });
  }

  useEffect(() => {
    let active = true;

    loadRef.current()
      .then((data) => {
        if (active) {
          setState({ status: "ready", data });
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setState({ status: "missing", message: error.message });
          return;
        }

        setState({
          status: "error",
          message: error instanceof ApiError ? error.message : "Không tải được dữ liệu.",
        });
      });

    return () => {
      active = false;
    };
  }, [requestKey]);

  return {
    state,
    retry: () => setAttempt((value) => value + 1),
  };
}
