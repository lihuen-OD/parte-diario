import type { ReactNode } from 'react';

export function BottomBar({ children }: { children: ReactNode }) {
  return <div className="bottom-bar"><div className="bottom-bar-inner">{children}</div></div>;
}
