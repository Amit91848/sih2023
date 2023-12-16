import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";
import { Status } from "@/types";

export interface IGrammarCheck {
	id: number;
	input_text: string;
	corrected_text: string;
	status: Status;
	created_at: Date;
	updated_at: Date;
	file_id: number;
}

export const getGrammarCheck = async ({ fileId }: { fileId: number | null }) => {
	const res = await cAxios.get<IGrammarCheck>(
		`${BACKEND_URL}/file/${fileId}/grammar-check`,
		{
			headers: {
				Authorization: `Bearer ${HEADER_TOKEN}`,
			},
		},
	);

	return res;
};
