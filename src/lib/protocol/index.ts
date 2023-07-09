import fs from "fs";
import path from "path";

const dataPathsUrl =
    "https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/dataPaths.json";
const protocolUrl =
    "https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/bedrock/{VERSION}/protocol.json";

let bedrockVersions: string[];

const bedrockPackets: Record<string, string[] | undefined> = {};

export async function init() {
    if (!fs.existsSync("protocol")) fs.mkdirSync("protocol");

    const response = await (await fetch(dataPathsUrl)).json();
    bedrockVersions = Object.keys(response.bedrock);

    const files = fs.readdirSync("protocol");
    for (const file of files) {
        fs.readFile(`protocol/${file}`, undefined, (err, data) => {
            if (err) throw err;

            bedrockPackets[path.parse(file).name] = JSON.parse(data.toString());
        });
    }
}

export async function downloadPackets(version: string) {
    const response = await (await fetch(protocolUrl.replace("{VERSION}", version))).json();
    const result = Object.values(response.types.mcpe_packet[1][0].type[1].mappings);

    fs.writeFileSync(`protocol/${version}.json`, JSON.stringify(result));
    return (bedrockPackets[version] = result as string[]);
}

export function getPackets(version: string) {
    return bedrockPackets[version];
}

export function getVersions() {
    return bedrockVersions;
}
