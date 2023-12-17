import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";

export interface IModel {
	id: string;
	author: string;
	downloads: string;
	likes: string;
	last_modified: string;
}

export const getSearchModelName = async (modelName: string) => {
	const res = await cAxios.get<IModel[]>(`${BACKEND_URL}/huggingface/${modelName}`, {
		headers: {
			Authorization: `Bearer ${HEADER_TOKEN}`,
		},
	});

	return res;
};
