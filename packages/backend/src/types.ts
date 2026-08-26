export interface ServerInfo {
  name: string;
  bunVersion: string;
  platform: string;
  arch: string;
  uptime: number;
  isStandalone?: boolean;
  embeddedAssetCount?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  liveReload?: boolean;
}

export interface Item {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface ServerOptions {
  port?: number;
  liveReload?: boolean;
}
