import { useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { grammarCheckText } from "@/api/file/grammarCheckText";
import { Loader2 } from "lucide-react";

export const GrammarCheckFields = () => {
	const [inputText, setInputText] = useState("");
	const defaultStyles = {
		variables: {
			light: {
				diffViewerBackground: "#fff",
				diffViewerColor: "#212529",
				addedBackground: "#fff",
				addedColor: "#24292e",
				removedBackground: "#fff",
				removedColor: "#24292e",
				wordAddedBackground: "#acf2bd",
				wordRemovedBackground: "#fdb8c0",
				addedGutterBackground: "#fff",
				removedGutterBackground: "#fff",
				gutterBackground: "#f7f7f7",
				gutterBackgroundDark: "#f3f1f1",
				highlightBackground: "#fffbdd",
				highlightGutterBackground: "#fff5b1",
				codeFoldGutterBackground: "#dbedff",
				codeFoldBackground: "#f1f8ff",
				emptyLineBackground: "#fafbfc",
				gutterColor: "#212529",
				addedGutterColor: "#212529",
				removedGutterColor: "#212529",
				codeFoldContentColor: "#212529",
				diffViewerTitleBackground: "#fafbfc",
				diffViewerTitleColor: "#212529",
				diffViewerTitleBorderColor: "#eee",
			},
			dark: {
				diffViewerBackground: "#2e303c",
				diffViewerColor: "#FFF",
				addedBackground: "#044B53",
				addedColor: "white",
				removedBackground: "#632F34",
				removedColor: "white",
				wordAddedBackground: "#055d67",
				wordRemovedBackground: "#7d383f",
				addedGutterBackground: "#034148",
				removedGutterBackground: "#632b30",
				gutterBackground: "#2c2f3a",
				gutterBackgroundDark: "#262933",
				highlightBackground: "#2a3967",
				highlightGutterBackground: "#2d4077",
				codeFoldGutterBackground: "#21232b",
				codeFoldBackground: "#262831",
				emptyLineBackground: "#363946",
				gutterColor: "#464c67",
				addedGutterColor: "#8c8c8c",
				removedGutterColor: "#8c8c8c",
				codeFoldContentColor: "#555a7b",
				diffViewerTitleBackground: "#2f323e",
				diffViewerTitleColor: "#555a7b",
				diffViewerTitleBorderColor: "#353846",
			},
		},
		contentText: { "font-size": "15px" },
	};

	const {
		mutate: requestGrammarCheck,
		data,
		isLoading,
		isSuccess,
	} = useMutation({
		mutationFn: grammarCheckText,
	});

	return (
		<>
			<div className="flex">
				{/* Left side: Input Text Area */}
				<div className="w-1/2 p-4 flex flex-col">
					<div>
						<div className="flex items-center justify-between">
							<label
								htmlFor="inputTextArea"
								className="text-lg font-semibold mb-2 block"
							>
								Input Text
							</label>
						</div>
						<Textarea
							id="inputTextArea"
							className="w-full p-2"
							placeholder="Enter up to 600 words of text..."
							rows={10}
							cols={10}
							value={inputText}
							onChange={(e) => {
								setInputText(e.currentTarget.value);
							}}
						/>
					</div>
					<div className="mt-4 self-end">
						<Button
							disabled={isLoading}
							onClick={() => requestGrammarCheck({ input_text: inputText })}
							className="w-28"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Grammar Check"
							)}
						</Button>
					</div>
				</div>
				{/* Right side: Summarized Text Area */}
				<div className="w-1/2 p-4">
					<label
						htmlFor="summarizedTextArea"
						className="text-lg font-semibold mb-2 block"
					>
						Grammar Check
					</label>
					<Textarea
						id="summarizedTextArea"
						className="w-full p-2"
						placeholder="Corrected Text will appear here...."
						rows={10}
						cols={10}
						readOnly
					/>
				</div>
			</div>
			{isSuccess && (
				<ReactDiffViewer
					styles={defaultStyles}
					oldValue={inputText}
					newValue={data.data?.corrected_text}
				/>
			)}
		</>
	);
};
