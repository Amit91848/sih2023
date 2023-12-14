import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";

export enum BatchSize {
	LONG = 1,
	MEDIUM = 2,
	SHORT = 3,
}

interface ISummarizeFileProps {
	fileId: number;
	batchSize: BatchSize;
}

export const summarizeFile = async ({ fileId, batchSize }: ISummarizeFileProps) => {
	const res = await cAxios.post(
		`${BACKEND_URL}/llm/summarize`,
		{ fileId, batchSize },
		{
			headers: {
				Authorization: `Bearer ${HEADER_TOKEN}`,
			},
		},
	);

	return res;
};
