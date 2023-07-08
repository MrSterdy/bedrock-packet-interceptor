import { toast } from "@zerodevx/svelte-toast";

export function sendToastDefault(text: string) {
    toast.push(text);
}

export function sendToastSuccess(text: string) {
    toast.push(text, {
        theme: {
            "--toastColor": "#FFFFFF",
            "--toastBackground": "rgba(72, 187, 120, 0.9)",
            "--toastBarBackground": "#2F855A"
        }
    });
}

export function sendToastError() {
    toast.push("An error occurred", {
        theme: {
            "--toastColor": "#FFFFFF",
            "--toastBackground": "#F44336",
            "--toastBarBackground": "#D32F2F"
        }
    });
}
