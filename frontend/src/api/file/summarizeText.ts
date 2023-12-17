import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";
import { BatchSize } from "./summarizeFile";

export interface ISummary {
	summary: string;
	time_taken: Date;
}

export const summarizeText = async ({
	text,
	batchSize,
}: {
	text: string;
	batchSize: BatchSize;
}) => {
	const res = await cAxios.post(
		`${BACKEND_URL}/llm/summarizeText`,
		{ text, batchSize },
		{
			headers: {
				Authorization: `Bearer ${HEADER_TOKEN}`,
			},
		},
	);

	return res;
};
