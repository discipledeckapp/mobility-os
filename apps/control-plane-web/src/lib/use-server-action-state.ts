'use client';

import { useCallback, useState, useTransition } from 'react';

type ServerAction<State, Payload> = (
  previousState: State,
  payload: Payload,
) => State | Promise<State>;

export function useServerActionState<State, Payload = FormData>(
  action: ServerAction<State, Payload>,
  initialState: State,
): [State, (payload: Payload) => void, boolean] {
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const formAction = useCallback(
    (payload: Payload) => {
      startTransition(() => {
        void Promise.resolve(action(state, payload)).then((nextState) => {
          setState(nextState);
        });
      });
    },
    [action, state, startTransition],
  );

  return [state, formAction, isPending];
}
