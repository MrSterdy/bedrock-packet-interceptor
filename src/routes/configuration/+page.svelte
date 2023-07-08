<script lang="ts">
    import { proxy, showPackets } from "$lib/proxy/store";
    import * as api from "$lib/proxy/api";

    const packets = [
        "login",
        "play_status",
        "server_to_client_handshake",
        "client_to_server_handshake",
        "disconnect",
        "resource_packs_info",
        "resource_pack_stack",
        "resource_pack_client_response",
        "text",
        "set_time",
        "start_game",
        "add_player",
        "add_entity",
        "remove_entity",
        "add_item_entity",
        "take_item_entity",
        "move_entity",
        "move_player",
        "rider_jump",
        "update_block",
        "add_painting",
        "tick_sync",
        "level_sound_event_old",
        "level_event",
        "block_event",
        "entity_event",
        "mob_effect",
        "update_attributes",
        "inventory_transaction",
        "mob_equipment",
        "mob_armor_equipment",
        "interact",
        "block_pick_request",
        "entity_pick_request",
        "player_action",
        "hurt_armor",
        "set_entity_data",
        "set_entity_motion",
        "set_entity_link",
        "set_health",
        "set_spawn_position",
        "animate",
        "respawn",
        "container_open",
        "container_close",
        "player_hotbar",
        "inventory_content",
        "inventory_slot",
        "container_set_data",
        "crafting_data",
        "crafting_event",
        "gui_data_pick_item",
        "adventure_settings",
        "block_entity_data",
        "player_input",
        "level_chunk",
        "set_commands_enabled",
        "set_difficulty",
        "change_dimension",
        "set_player_game_type",
        "player_list",
        "simple_event",
        "event",
        "spawn_experience_orb",
        "clientbound_map_item_data",
        "map_info_request",
        "request_chunk_radius",
        "chunk_radius_update",
        "item_frame_drop_item",
        "game_rules_changed",
        "camera",
        "boss_event",
        "show_credits",
        "available_commands",
        "command_request",
        "command_block_update",
        "command_output",
        "update_trade",
        "update_equipment",
        "resource_pack_data_info",
        "resource_pack_chunk_data",
        "resource_pack_chunk_request",
        "transfer",
        "play_sound",
        "stop_sound",
        "set_title",
        "add_behavior_tree",
        "structure_block_update",
        "show_store_offer",
        "purchase_receipt",
        "player_skin",
        "sub_client_login",
        "initiate_web_socket_connection",
        "set_last_hurt_by",
        "book_edit",
        "npc_request",
        "photo_transfer",
        "modal_form_request",
        "modal_form_response",
        "server_settings_request",
        "server_settings_response",
        "show_profile",
        "set_default_game_type",
        "remove_objective",
        "set_display_objective",
        "set_score",
        "lab_table",
        "update_block_synced",
        "move_entity_delta",
        "set_scoreboard_identity",
        "set_local_player_as_initialized",
        "update_soft_enum",
        "network_stack_latency",
        "script_custom_event",
        "spawn_particle_effect",
        "available_entity_identifiers",
        "level_sound_event_v2",
        "network_chunk_publisher_update",
        "biome_definition_list",
        "level_sound_event",
        "level_event_generic",
        "lectern_update",
        "video_stream_connect",
        "add_ecs_entity",
        "remove_ecs_entity",
        "client_cache_status",
        "on_screen_texture_animation",
        "map_create_locked_copy",
        "structure_template_data_export_request",
        "structure_template_data_export_response",
        "update_block_properties",
        "client_cache_blob_status",
        "client_cache_miss_response",
        "education_settings",
        "emote",
        "multiplayer_settings",
        "settings_command",
        "anvil_damage",
        "completed_using_item",
        "network_settings",
        "player_auth_input",
        "creative_content",
        "player_enchant_options",
        "item_stack_request",
        "item_stack_response",
        "player_armor_damage",
        "update_player_game_type",
        "emote_list",
        "position_tracking_db_request",
        "position_tracking_db_broadcast",
        "packet_violation_warning",
        "motion_prediction_hints",
        "animate_entity",
        "camera_shake",
        "player_fog",
        "correct_player_move_prediction",
        "item_component",
        "filter_text_packet",
        "debug_renderer",
        "sync_entity_property",
        "add_volume_entity",
        "remove_volume_entity",
        "simulation_type",
        "npc_dialogue",
        "edu_uri_resource_packet",
        "create_photo",
        "update_subchunk_blocks",
        "photo_info_request",
        "subchunk",
        "subchunk_request",
        "client_start_item_cooldown",
        "script_message",
        "code_builder_source",
        "ticking_areas_load_status",
        "dimension_data",
        "agent_action",
        "change_mob_property",
        "lesson_progress",
        "request_ability",
        "request_permissions",
        "toast_request",
        "update_abilities",
        "update_adventure_settings",
        "death_info",
        "editor_network",
        "feature_registry",
        "server_stats",
        "request_network_settings",
        "game_test_request",
        "game_test_results",
        "update_client_input_locks",
        "client_cheat_ability",
        "camera_presets",
        "unlocked_recipes",
        "camera_instruction",
        "compressed_biome_definitions",
        "trim_data",
        "open_sign"
    ];

    function updatePackets(event) {
        const packet = event.target.name;

        if (event.target.checked) {
            showPackets.update((packets) => [...packets, packet]);
        } else {
            showPackets.update((packets) => packets.filter((p) => p !== packet));
        }
    }

    function startProxy() {
        $proxy.state = "starting";

        return api.start({ sourcePort: +sourcePort, ip, port: +port });
    }

    function stopProxy() {
        $proxy.state = "closing";

        return api.stop();
    }

    let sourcePort = $proxy.sourcePort ?? "";
    let ip = $proxy.ip ?? "";
    let port = $proxy.port ?? "";

    $: $proxy.sourcePort = +sourcePort;
    $: $proxy.ip = ip;
    $: $proxy.port = +port;
</script>

<form id="configuration">
    <h1 class="title">Configuration</h1>

    <section class="settings">
        <h2>Proxy</h2>

        <section id="transport-settings">
            <input
                id="source-port"
                placeholder="SOURCE PORT"
                type="tel"
                required
                bind:value={sourcePort}
                class={$proxy.state !== "uninitialized" ? "inactive" : ""}
            />
            <div id="destination-settings">
                <input
                    id="dest-ip"
                    placeholder="DESTINATION IP"
                    type="text"
                    required
                    pattern="(^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$)|(^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$)"
                    bind:value={ip}
                    class={$proxy.state !== "uninitialized" ? "inactive" : ""}
                />
                <input
                    id="dest-port"
                    placeholder="DESTINATION PORT"
                    type="tel"
                    required
                    bind:value={port}
                    class={$proxy.state !== "uninitialized" ? "inactive" : ""}
                />
            </div>
        </section>
    </section>

    <section class="settings">
        <h2>Logger</h2>

        <section>
            <div id="filter-settings">
                <button
                    id="filter"
                    type="button"
                    on:click={() => document.getElementById("packets").classList.toggle("hidden")}
                    >FILTER</button
                >

                <ul id="packets" class="hidden">
                    {#each packets as packet}
                        <li>
                            {#if $showPackets.includes(packet)}
                                <input
                                    type="checkbox"
                                    name={packet}
                                    checked
                                    on:change={updatePackets}
                                />
                            {:else}
                                <input type="checkbox" name={packet} on:change={updatePackets} />
                            {/if}

                            <span
                                >{packet
                                    .split("_")
                                    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
                                    .join("")}</span
                            >
                        </li>
                    {/each}
                </ul>
            </div>
        </section>
    </section>

    <section id="manage">
        <button
            id="start"
            type="button"
            on:click={startProxy}
            class={$proxy.state !== "uninitialized" ? "inactive" : ""}
            >START</button
        >
        <button
            id="stop"
            type="button"
            class={$proxy.state !== "running" ? "inactive" : ""}
            on:click={stopProxy}>STOP</button
        >
    </section>
</form>

<style>
    #configuration {
        display: flex;
        flex-direction: column;

        gap: 1rem;
        margin: 0 auto;

        max-width: 50rem;
    }

    #transport-settings {
        display: flex;
        flex-direction: column;

        width: 100%;

        gap: 10px;
    }

    #destination-settings {
        display: flex;

        gap: 5px;
    }

    #filter-settings,
    #manage {
        display: flex;

        width: 100%;

        gap: 5px;
    }

    #filter-settings {
        flex-direction: column;
        gap: 10px;
    }

    #destination-settings input,
    #manage button {
        width: 50%;
    }

    form:invalid #start {
        border-color: rgba(255, 255, 255, 0.4) !important;
        color: rgba(255, 255, 255, 0.4) !important;

        pointer-events: none;
    }

    .settings > :nth-child(2) {
        border-radius: 10px;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 1rem;
    }

    #filter {
        width: 100%;
    }

    #packets {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
        word-wrap: anywhere;
        gap: 10px;
    }

    #packets > li {
        display: flex;
        align-items: center;

        gap: 5px;
    }

    #start {
        border-color: #66bb6a;
        color: #66bb6a;
    }

    #stop {
        border-color: #f44336;
        color: #f44336;
    }
</style>
