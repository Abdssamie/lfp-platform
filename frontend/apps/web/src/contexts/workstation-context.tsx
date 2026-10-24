"use client";

import * as React from "react";

export type WorkspaceMode = "formation" | "cyclers" | "btms";
export type CyclerDatasetKey = "novonix" | "neware" | "lfp";

export interface WorkstationContextType {
  workspace: WorkspaceMode;
  setWorkspace: (mode: WorkspaceMode) => void;
  dataset: CyclerDatasetKey;
  setDataset: (dataset: CyclerDatasetKey) => void;
  selectedChannel: number;
  setSelectedChannel: (channel: number) => void;
  refreshTrigger: number;
  reloadAll: () => void;
}

const defaultWorkstationContext: WorkstationContextType = {
  workspace: "formation",
  setWorkspace: () => {},
  dataset: "novonix",
  setDataset: () => {},
  selectedChannel: 1,
  setSelectedChannel: () => {},
  refreshTrigger: 0,
  reloadAll: () => {},
};

const WorkstationContext = React.createContext<WorkstationContextType>(defaultWorkstationContext);

export function WorkstationProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = React.useState<WorkspaceMode>("formation");
  const [dataset, setDataset] = React.useState<CyclerDatasetKey>("novonix");
  const [selectedChannel, setSelectedChannel] = React.useState<number>(1);
  const [refreshTrigger, setRefreshTrigger] = React.useState<number>(0);

  const reloadAll = React.useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const value = React.useMemo(
    () => ({
      workspace,
      setWorkspace,
      dataset,
      setDataset,
      selectedChannel,
      setSelectedChannel,
      refreshTrigger,
      reloadAll,
    }),
    [workspace, dataset, selectedChannel, refreshTrigger, reloadAll],
  );

  return (
    <WorkstationContext.Provider value={value}>
      {children}
    </WorkstationContext.Provider>
  );
}

export function useWorkstation(): WorkstationContextType {
  const context = React.useContext(WorkstationContext);
  return context ?? defaultWorkstationContext;
}
