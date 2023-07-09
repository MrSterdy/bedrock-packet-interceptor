import type { Packet, Proxy } from "$lib/proxy/types";

export type ServerSignalEvent = "proxy_start" | "proxy_stop";
export type ServerPayloadEvent =
    | "server_error"
    | "proxy_packet"
    | "protocol_downloaded"
    | "code_received";
export type ServerEvent = ServerSignalEvent | ServerPayloadEvent;

export type ServerPayload<TEvent extends ServerPayloadEvent> = TEvent extends "code_received"
    ? {
          code: string;
          url: string;
      }
    : TEvent extends "server_error"
    ? { stack?: string; message?: string }
    : TEvent extends "protocol_downloaded"
    ? { version: string; packets: string[] }
    : TEvent extends "proxy_packet"
    ? Packet & { boundary: "serverbound" | "clientbound"; timestamp: number }
    : never;

export type ClientSignalEvent = "proxy_stop";
export type ClientPayloadEvent = "proxy_start" | "proxy_set_allowed_packets";
export type ClientEvent = ClientSignalEvent | ClientPayloadEvent;

export type ClientPayload<TEvent extends ClientPayloadEvent> = TEvent extends "proxy_start"
    ? Omit<Proxy, "state">
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
