import axios, { AxiosRequestConfig, AxiosError } from "axios";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function msToTime(s) {
	// Pad to 2 or 3 digits, default is 2
	function pad(n, z) {
		z = z || 2;
		return ("00" + n).slice(-z);
	}

	var ms = s % 1000;
	s = (s - ms) / 1000;
	var secs = s % 60;
	s = (s - secs) / 60;
	var mins = s % 60;
	var hrs = (s - mins) / 60;

	return (
		pad(hrs) + "hrs " + pad(mins) + "mins " + pad(secs) + "secs " + pad(ms, 3) + "ms"
	);
}

// {
//   "success": true,
//   "data": {
//       "name": "aadharCard.pdf",
//       "contentType": "application/pdf"
//   }
// }

export interface APIResponse<T> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
	};
}

export async function handleRequest<T>(
	config: AxiosRequestConfig,
): Promise<APIResponse<T>> {
	try {
		const response = await axios<APIResponse<T>>(config);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const axiosError: AxiosError = error;
			if (axiosError.response?.data?.success === false) {
				// Handle error dynamically based on the backend response structure
				return axiosError.response.data;
			}
		}

		// Fallback for unknown errors
		return {
			success: false,
			error: {
				code: "UNKNOWN_ERROR",
				message: "Unknown error occurred",
			},
		};
	}
}

export const cAxios = {
	get: async <T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> =>
		handleRequest<T>({ ...config, method: "get", url }),
	post: async <T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig,
	): Promise<APIResponse<T>> =>
		handleRequest<T>({ ...config, method: "post", url, data }),
	put: async <T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig,
	): Promise<APIResponse<T>> =>
		handleRequest<T>({ ...config, method: "put", url, data }),
	delete: async <T>(
		url: string,
		config?: AxiosRequestConfig,
	): Promise<APIResponse<T>> => handleRequest<T>({ ...config, method: "delete", url }),
	// Add more methods as needed
};
export const BACKEND_URL = "http://localhost:8000/api";

export const HEADER_TOKEN =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDMwNzkyNDEsInN1YiI6IjEifQ.PpCTdZkFwd3uvBq2kylBROYfdCskOdTc9yRorP9TWrM";
