import { toast } from "@zerodevx/svelte-toast";

export function sendToastDefault(text: string) {
    toast.push(text);
}

export function sendToastSuccess(text: string) {
    toast.push(text, {
        theme: {
            "--toastColor": "mintcream",
            "--toastBackground": "rgba(72, 187, 120, 0.9)",
            "--toastBarBackground": "#2F855A"
        }
    });
}
