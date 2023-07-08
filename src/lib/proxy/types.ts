export type ServerSignalEvent = "start" | "stop";
export type ServerPayloadEvent = "proxy_error" | "packet" | "code";
export type ServerEvent = ServerSignalEvent | ServerPayloadEvent;

export type ServerPayload<TEvent extends ServerPayloadEvent> = TEvent extends "code"
    ? {
          code: string;
          url: string;
      }
    : TEvent extends "proxy_error"
    ? object
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
    state: "starting" | "running" | "closing" | "uninitialized";
};

declare interface ProxyEmitter {
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
