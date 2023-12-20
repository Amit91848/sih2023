import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";
import { BatchSize } from "./summarizeFile";

interface ISummary {
	summary: string;
	time_taken: Date;
	bleu_score: number;
}

export const summarizeText = async ({
	text,
	batchSize,
}: {
	text: string;
	batchSize: BatchSize;
}) => {
	const res = await cAxios.post<ISummary>(
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
