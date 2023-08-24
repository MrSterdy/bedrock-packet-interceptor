export function formatPacketName(packet: string) {
    return packet
        .split("_")
        .map((word) => `${word[0]!.toUpperCase()}${word.slice(1)}`)
        .join("");
}
