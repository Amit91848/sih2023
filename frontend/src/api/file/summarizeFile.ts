import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";

export const summarizeFile = async (fileId: number) => {
	const res = await cAxios.post(`${BACKEND_URL}/llm/summarize`, fileId, {
		headers: {
			Authorization: `Bearer ${HEADER_TOKEN}`,
		},
	});

	return res;
};
