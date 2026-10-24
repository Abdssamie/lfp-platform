import { type ReactNode } from "react";
import { UnheadProvider } from "@unhead/react/client";
import { head } from "./head";

interface HeadProviderProps {
  children: ReactNode;
}

export function HeadProvider({ children }: HeadProviderProps) {
  return <UnheadProvider head={head}>{children}</UnheadProvider>;
}
