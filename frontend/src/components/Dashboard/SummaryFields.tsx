import { Textarea } from "@/components/ui/textarea";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { summarizeText } from "@/api/file/summarizeText";
import { Loader2 } from "lucide-react";

const SummaryFields = () => {
	const [inputText, setInputText] = useState<string>("");

	const [batchSize, setBatchSize] = useState<number[]>([2]);

	const {
		mutate: generateSummary,
		data,
		isLoading,
	} = useMutation({
		mutationFn: summarizeText,
	});

	return (
		<div className="flex">
			{/* Left side: Input Text Area */}
			<div className="w-1/2 p-4 flex flex-col">
				<div>
					<div className="flex items-center justify-between">
						<label htmlFor="inputTextArea" className="text-lg font-semibold mb-2 block">
							Input Text
						</label>
						<div className="w-2/5 flex gap-2">
							<div>Long</div>
							<Slider
								className="mx-2 cursor-pointer"
								min={1}
								max={3}
								step={1}
								defaultValue={[2]}
								onValueChange={(e) => setBatchSize(e)}
								value={batchSize}
							/>
							<div>Short</div>
						</div>
					</div>
					<Textarea
						id="inputTextArea"
						className="w-full p-2 text-green-400"
						placeholder="Enter up to 600 words of text..."
						rows={17}
						cols={17}
						value={inputText}
						onChange={(e) => {
							setInputText(e.currentTarget.value);
						}}
					/>
				</div>
				<div className="mt-4 self-end">
					<Button
						disabled={isLoading}
						onClick={() =>
							generateSummary({ batchSize: batchSize[0], text: inputText })
						}
						className="w-28"
					>
						{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Summarize"}
					</Button>
				</div>
			</div>
			{/* Right side: Summarized Text Area */}
			<div className="w-1/2 p-4">
				<label
					htmlFor="summarizedTextArea"
					className="text-lg font-semibold mb-2 block"
				>
					Summarized Text
				</label>
				<Textarea
					id="summarizedTextArea"
					className="w-full p-2"
					placeholder="Summarized text will appear here..."
					rows={17}
					cols={17}
					value={data?.data?.summary ? data.data.summary : ""}
					readOnly
				/>
			</div>
		</div>
	);
};

export default SummaryFields;
