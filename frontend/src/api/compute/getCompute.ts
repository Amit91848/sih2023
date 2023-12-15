import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";

export interface IComputeInfo {
	ram: string;
	gpu: string;
	cpu: string;
	model_name: string | null;
}

export const getComputeInfo = async () => {
	const res = await cAxios.get<IComputeInfo>(`${BACKEND_URL}/compute/info`, {
		headers: {
			Authorization: `Bearer ${HEADER_TOKEN}`,
		},
	});

	return res;
};
