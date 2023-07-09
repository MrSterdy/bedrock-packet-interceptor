export type Proxy = {
    sourcePort: string;
    ip: string;
    port: string;
    version: string;
    isAuthenticated: boolean;
    state: "starting" | "running" | "closing" | "uninitialized";
};

export type Packet = {
    name: string;
    params: object;
};
