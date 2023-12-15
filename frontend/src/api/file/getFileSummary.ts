import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";
import { BatchSize } from "./summarizeFile";
import { Status } from "@/types";

export interface ISummary {
	type: BatchSize;
	summary: string;
	id: number;
	status: Status;
	created_at: Date;
	updated_at: Date;
	file_id: number;
}

export const getFileSummary = async ({
	file_id,
	batchSize,
}: {
	file_id: number;
	batchSize: BatchSize;
}) => {
	console.log(file_id, batchSize);
	const res = await cAxios.get<ISummary>(
		`${BACKEND_URL}/file/${file_id}/summary/${batchSize}`,
		{
			headers: {
				Authorization: `Bearer ${HEADER_TOKEN}`,
			},
		},
	);

	return res;
};
