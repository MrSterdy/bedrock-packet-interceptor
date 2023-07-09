export type ServerSignalEvent = "start" | "stop";
export type ServerPayloadEvent = "proxy_error" | "download" | "packet" | "code";
export type ServerEvent = ServerSignalEvent | ServerPayloadEvent;

export type ServerPayload<TEvent extends ServerPayloadEvent> = TEvent extends "code"
    ? {
          code: string;
          url: string;
      }
    : TEvent extends "proxy_error"
    ? object
    : TEvent extends "download"
    ? string[]
    : TEvent extends "packet"
    ? Packet & { boundary: "serverbound" | "clientbound"; timestamp: number }
    : never;

export type ClientSignalEvent = "stop";
export type ClientPayloadEvent = "start" | "set_allowed_packets";
export type ClientEvent = ClientSignalEvent | ClientPayloadEvent;

export type ClientPayload<TEvent extends ClientPayloadEvent> = TEvent extends "start"
    ? {
          sourcePort: number;
          ip: string;
          port: number;
          version: string;
      }
    : string[];

export type ClientMessage<TEvent extends ClientEvent = ClientEvent> =
    TEvent extends ClientPayloadEvent
        ? {
              event: TEvent;
              payload: ClientPayload<TEvent>;
          }
        : {
              event: TEvent;
          };

export type Packet = {
    name: string;
    params: object;
};

export type Proxy = {
    sourcePort: string;
    ip: string;
    port: string;
    version: string;
    state: "starting" | "running" | "closing" | "uninitialized";
};

declare interface ProxyEmitter {
    on<TEvent extends ServerEvent | "all", TPayloadEvent extends ServerEvent>(
        event: TEvent,
        listener: TEvent extends "all"
            ? (payload: {
                  eventName: TPayloadEvent;
                  args: TPayloadEvent extends ServerPayloadEvent
                      ? ServerPayload<TPayloadEvent>
                      : never;
              }) => void
            : TEvent extends ServerPayloadEvent
            ? (payload: ServerPayload<TEvent>) => void
            : () => void
    ): this;

    off<TEvent extends ServerEvent | "all", TPayloadEvent extends ServerEvent>(
        event: TEvent,
        listener: TEvent extends "all"
            ? (payload: {
                  eventName: TPayloadEvent;
                  args: TPayloadEvent extends ServerPayloadEvent
                      ? ServerPayload<TPayloadEvent>
                      : never;
              }) => void
            : TEvent extends ServerPayloadEvent
            ? (payload: ServerPayload<TEvent>) => void
            : () => void
    ): this;

    emit<TEvent extends ServerEvent>(
        event: "all",
        payload: {
            eventName: TEvent;
            args: TEvent extends ServerPayloadEvent ? ServerPayload<TEvent> : never;
        }
    ): boolean;
    emit<TEvent extends ServerSignalEvent>(event: TEvent): boolean;
    emit<TEvent extends ServerPayloadEvent>(event: TEvent, payload: ServerPayload<TEvent>): boolean;
}
