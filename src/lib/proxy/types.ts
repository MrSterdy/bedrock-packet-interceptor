export type Proxy = {
    sourcePort: number;
    ip: string;
    port: number;
    version: string;
    isAuthenticated: boolean;
    state: "starting" | "running" | "closing" | "uninitialized";
};

export type Packet = {
    name: string;
    params: object;
};
