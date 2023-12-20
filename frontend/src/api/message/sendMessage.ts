import { BACKEND_URL, HEADER_TOKEN } from "@/lib/utils";

interface ISendMessage {
	message: string;
	fileId: number;
}

export const sendMessageText = async ({ fileId, message }: ISendMessage) => {
	const response = await fetch(`${BACKEND_URL}/message`, {
		method: "POST",
		body: JSON.stringify({
			fileId: fileId,
			message: message,
		}),
		headers: {
			Authorization: `Bearer ${HEADER_TOKEN}`,
		},
	});
	if (!response.ok) {
		throw new Error("Failed to send message");
	}
	return response.body;
};
