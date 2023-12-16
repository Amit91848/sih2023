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

export const grammarCheckFile = async ({ fileId }: { fileId: number }) => {
	const res = await cAxios.post(
		`${BACKEND_URL}/llm/grammar-check`,
		{ fileId },
		{
			headers: {
				Authorization: `Bearer ${HEADER_TOKEN}`,
			},
		},
	);

	return res;
};
