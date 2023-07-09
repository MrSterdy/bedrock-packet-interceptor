import { EventEmitter } from "events";

import type {
    ServerEvent,
    ServerPayload,
    ServerPayloadEvent,
    ServerSignalEvent
} from "$lib/events/types";

declare interface BackendEmitter {
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

class BackendEmitter extends EventEmitter {
    emit(event: ServerEvent | "all", payload?: object): boolean {
        const result = super.emit(event, payload);

        if (event !== "all") return this.emit("all", { eventName: event, args: payload });

        return result;
    }
}

const Emitter = new BackendEmitter();

export default Emitter;
