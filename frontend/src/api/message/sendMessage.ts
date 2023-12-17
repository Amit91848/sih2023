import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";

interface ISendMessage {
	message: string;
	fileId: number;
}

export const sendMessageText = async ({ fileId, message }: ISendMessage) => {
	// const res = await cAxios.post(
	// 	`${BACKEND_URL}/message`,
	// 	{ fileId, message },
	// 	{
	// 		headers: {
	// 			Authorization: `Bearer ${HEADER_TOKEN}`,
	// 		},
	// 		responseType: "stream",
	// 	},
	// );
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
