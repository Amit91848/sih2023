import { Textarea } from "@/components/ui/textarea";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const SummaryFields = () => {
  const [inputText, setInputText] = useState<string>("");

  const {} = useMutation({
    mutationFn: generateSummary
  })

	return (
		<div className="flex">
			{/* Left side: Input Text Area */}
			<div className="w-1/2 p-4 flex flex-col">
				<div>
					<div className="flex items-center justify-between">
						<label htmlFor="inputTextArea" className="text-lg font-semibold mb-2 block">
							Input Text
						</label>
						<div className="w-1/3 flex gap-2">
							<div>Short</div>
							<Slider className="mx-2" min={1} max={3} step={1} defaultValue={[2]} />
							<div>Long</div>
						</div>
					</div>
					<Textarea
						id="inputTextArea"
						className="w-full p-2"
						placeholder="Enter up to 600 words of text..."
						rows={17}
						cols={17}
						// value={inputText}
						onChange={(e) => {setInputText(e.currentTarget.value)}}
					/>
				</div>
				<div className="mt-2 self-end">
					<Button onClick={() => }>Summarize</Button>
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
					// value={summarizedText}
					readOnly
				/>
			</div>
		</div>
	);
};

export default SummaryFields;
