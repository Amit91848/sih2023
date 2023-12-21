import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";
import { IFile } from "@/types";

export const getUserFiles = async () => {
	const res = await cAxios.get<IFile[]>(`${BACKEND_URL}/userFiles/getAll`, {
		headers: {
			Authorization: `Bearer ${HEADER_TOKEN}`,
		},
	});

	return res;
};
