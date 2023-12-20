import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";
import { ISummary } from "./getFileSummary";

export const getLatestShortSummary = async (fileId: number) => {
	const res = await cAxios.get<ISummary>(
		`${BACKEND_URL}/llm/get-latest-short-summary/${fileId}`,
		{
			headers: {
				Authorization: `Bearer ${HEADER_TOKEN}`,
			},
		},
	);

	return res;
};
