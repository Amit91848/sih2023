import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils";

interface IGrammarCheck {
	corrected_text: string;
	time_taken: Date;
}

export const grammarCheckText = async ({ input_text }: { input_text: string }) => {
	const res = await cAxios.post<IGrammarCheck>(
		`${BACKEND_URL}/llm/grammarCheckText`,
		{ input_text },
		{
			headers: {
				Authorization: `Bearer ${HEADER_TOKEN}`,
			},
		},
	);

	return res;
};
