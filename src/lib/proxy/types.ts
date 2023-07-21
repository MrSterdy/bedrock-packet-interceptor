export type Proxy = {
    sourcePort: number;
    ip: string;
    port: number;
    version: string;
    offline: boolean;
    isAuthenticated: boolean;
    state: "starting" | "running" | "closing" | "uninitialized";
};

export type Packet = {
    name: string;
    params: object;
};
