import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";

export interface IModelInfo {
	id: string;
	author: string;
	downloads: string;
	likes: string;
	last_modified: string;
	config: {
		model_type: string;
		quantization_config: {
			quant_method: string;
		};
	};
	siblings: {
		rfilename: string;
		size: number;
		blob_ind: string;
		lfs: null | {
			size: number;
			sha256: string;
			pointer_size: number;
		};
	}[];
}

export const getModelInfo = async (modelId: string) => {
	const res = await cAxios.get<IModelInfo>(
		`${BACKEND_URL}/huggingface/${modelId}/info`,
		{
			headers: {
				Authorization: `Bearer ${HEADER_TOKEN}`,
			},
		},
	);

	return res;
};
