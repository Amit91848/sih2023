import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";

interface IShortSummary {
	summary: string;
}

export const generateShortSummary = async (file_id: number) => {
	const res = await cAxios.post<IShortSummary>(
		`${BACKEND_URL}/llm/generate-short-summary`,
		{ file_id: file_id },
		{
			headers: {
				Authorization: `Bearer ${HEADER_TOKEN}`,
			},
		},
	);

	return res;
};
