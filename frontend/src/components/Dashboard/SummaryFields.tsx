import { Textarea } from "@/components/ui/textarea";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { summarizeText } from "@/api/file/summarizeText";
import { Clipboard, Loader2, MoveDown } from "lucide-react";
import toast from "react-hot-toast";
import { Label } from "@radix-ui/react-label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { BatchSize } from "@/api/file/summarizeFile";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const SummaryFields = () => {
	const [inputText, setInputText] = useState<string>("");

	const [batchSize, setBatchSize] = useState<number>(1);

	const {
		mutate: generateSummary,
		data,
		isLoading,
	} = useMutation({
		mutationFn: summarizeText,
	});

	const words = data?.data?.summary.trim().split(/\s+/);

	return (
		<div className="flex">
			{/* Left side: Input Text Area */}
			<div className="w-1/2 p-4 flex flex-col">
				<div>
					<div className="flex items-center justify-between mb-4">
						<label htmlFor="inputTextArea" className="text-lg font-semibold mb-2 block">
							Input Text
						</label>
						{/* <div className="w-2/5 flex gap-2"> */}
						{/* <div>Long</div>
							<Slider
								className="mx-2 cursor-pointer"
								min={1}
								max={3}
								step={1}
								defaultValue={[2]}
								onValueChange={(e) => setBatchSize(e)}
								value={batchSize}
							/>
							<div>Short</div> */}
						{/* <DropdownMenu>
							<DropdownMenuTrigger>
								<Button disabled={isLoading} variant="outline" className="flex gap-1">
									<span>
										{!isLoading ? "Select Summary Length" : "Generating Summary"}
									</span>{" "}
									<MoveDown width={15} height={15} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuGroup>
									<DropdownMenuItem
										className="cursor-pointer"
										onClick={() =>
											generateSummary({ batchSize: BatchSize.LONG, text: inputText })
										}
									>
										Long
									</DropdownMenuItem>
									<DropdownMenuItem
										className="cursor-pointer"
										onClick={() =>
											generateSummary({ text: inputText, batchSize: BatchSize.MEDIUM })
										}
									>
										Medium
									</DropdownMenuItem>
									<DropdownMenuItem
										className="cursor-pointer"
										onClick={() =>
											generateSummary({ text: inputText, batchSize: BatchSize.SHORT })
										}
									>
										Short
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu> */}
						<div className="flex w-fit gap-3 items-center ">
							<p className="whitespace-nowrap">Select summary length</p>
							<Select onValueChange={(e) => setBatchSize(parseInt(e))} defaultValue="1">
								<SelectTrigger>
									<SelectValue placeholder="Select summary length" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="1">Long</SelectItem>
										<SelectItem value="2">Medium</SelectItem>
										<SelectItem value="3">Short</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
						{/* </div> */}
					</div>
					<Textarea
						id="inputTextArea"
						className="w-full p-2 "
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
						onClick={() => generateSummary({ batchSize: batchSize, text: inputText })}
						className="w-28"
					>
						{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Summarize"}
					</Button>
				</div>
			</div>
			{/* Right side: Summarized Text Area */}
			<div className="w-1/2 p-4">
				<div className="flex justify-between items-center mb-3">
					<label
						htmlFor="summarizedTextArea"
						className="text-lg font-semibold mb-2 block"
					>
						Summarized Text
					</label>
					<Button
						onClick={() => {
							toast.success("Copied corrected text to clipboard!");
							navigator.clipboard.writeText(data?.data?.corrected_text || "");
						}}
					>
						<Clipboard width={14} height={14} />
					</Button>
				</div>
				<div>
					<Textarea
						id="summarizedTextArea"
						className="w-full p-2"
						placeholder="Summarized text will appear here..."
						rows={17}
						cols={17}
						value={data?.data?.summary ? data.data.summary : ""}
						readOnly
					/>
					<div className="mt-4 flex">
						{data?.data?.time_taken && (
							<div className="text-sm self-end">
								<p>BLEU Score: {data.data.bleu_score}</p>
								<p>Time taken: {data.data.time_taken} seconds</p> 
								<p>Word Count: {words?.length}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SummaryFields;
