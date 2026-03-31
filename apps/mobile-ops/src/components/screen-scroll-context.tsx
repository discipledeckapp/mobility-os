import { createContext, useContext } from 'react';

type ScreenScrollContextValue = {
  scrollToInput: (y: number) => void;
};

const ScreenScrollContext = createContext<ScreenScrollContextValue | null>(null);

export function ScreenScrollProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ScreenScrollContextValue;
}) {
  return <ScreenScrollContext.Provider value={value}>{children}</ScreenScrollContext.Provider>;
}

export function useScreenScroll() {
  return useContext(ScreenScrollContext);
}
