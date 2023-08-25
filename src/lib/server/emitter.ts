import { EventEmitter } from "events";

import type { ServerEvent, ServerPayload } from "$lib/types";

interface TypedEmitter {
    on<TEvent extends ServerEvent, TPayloadEvent extends ServerEvent = ServerEvent>(
        event: TEvent,
        listener: (payload: ServerPayload<TEvent, TPayloadEvent>) => void
    ): this;

    off<TEvent extends ServerEvent, TPayloadEvent extends ServerEvent = ServerEvent>(
        event: TEvent,
        listener: (payload: ServerPayload<TEvent, TPayloadEvent>) => void
    ): this;

    emit<TEvent extends ServerEvent, TPayloadEvent extends ServerEvent = ServerEvent>(
        event: TEvent,
        payload: ServerPayload<TEvent, TPayloadEvent>
    ): boolean;
}

class BackendEmitter extends EventEmitter implements TypedEmitter {
    emit<TEvent extends ServerEvent, TPayloadEvent extends ServerEvent = ServerEvent>(
        event: TEvent,
        payload: ServerPayload<TEvent, TPayloadEvent>
    ): boolean {
        const result = super.emit(event, payload);

        if (event !== "all") {
            return this.emit("all", { event, payload });
        }

        return result;
    }
}

const Emitter = new BackendEmitter();

export default Emitter;
