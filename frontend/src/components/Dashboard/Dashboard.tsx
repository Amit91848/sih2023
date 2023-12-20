"use client";

import React, { useState } from "react";

// import Link from "next/link";
import UploadButton from "../UploadButton";
import { Header } from "../ui/header";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	VTabsList,
	VTabsTrigger,
} from "../ui/tabs";
import { Files } from "./Files";
import { useDataTable } from "@/hooks/use-data-table";
import { Checkbox } from "../ui/checkbox";
import { DataTableFilterableColumn, DataTableSearchableColumn } from "@/types";
import { Dialog, DialogContent } from "../ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BatchSize } from "@/api/file/summarizeFile";
import { getFileSummary } from "@/api/file/getFileSummary";
import ReactDiffViewer from "react-diff-viewer-continued";
import { getFile } from "@/api/file/getFile";
import { msToTime } from "@/lib/utils";
import { getGrammarCheck } from "@/api/file/getGrammarCheck";
import SummaryFields from "./SummaryFields";
import { GrammarCheckFields } from "./GrammarCheckerFields";
import { EmptyScreen } from "../EmptyScreen";
import { Textarea } from "../ui/textarea";
import { SearchPage } from "./SearchPage";
import { getLatestShortSummary } from "@/api/file/getShortSummary";

// enum DiffMethod {
// 	CHARS = "diffChars",
// 	WORDS = "diffWords",
// 	WORDS_WITH_SPACE = "diffWordsWithSpace",
// 	LINES = "diffLines",
// 	TRIMMED_LINES = "diffTrimmedLines",
// 	SENTENCES = "diffSentences",
// 	CSS = "diffCss",
// }

const Dashboard = () => {
	const columns = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(value) => {
						table.toggleAllPageRowsSelected(!!value);
					}}
					aria-label="Select all"
					className="translate-y-[2px]"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => {
						row.toggleSelected(!!value);
					}}
					aria-label="Select row"
					className="translate-y-[2px]"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
	];

	const queryClient = useQueryClient();

	const summary: string | undefined = queryClient.getQueryData(["file", "summary"]);

	const data = [];
	const pageCount = 4;

	const filterableColumns: DataTableFilterableColumn<any>[] = [
		{
			id: "status",
			title: "Status",
			options: [{ label: "something", value: "1" }],
		},
	];

	const searchableColumns: DataTableSearchableColumn<any>[] = [
		{
			id: "title",
			title: "titles",
		},
	];

	const { dataTable } = useDataTable({
		columns,
		data,
		pageCount,
		filterableColumns,
		searchableColumns,
	});

	const [summaryFileId, setSummaryFileId] = useState<number | null>(null);
	const [grammarCheckFileId, setGrammarCheckFileId] = useState<number | null>(null);
	const [dialogContent, setDialogContent] = useState<string | null>(null);

	return (
		<main className="mx-auto max-w-[90rem] md:p-10">
			{/* <Header title="Dashboard">
				<UploadButton />
			</Header> */}

			{/* display all user files */}
			<div className="justify-center">
				<Tabs defaultValue="files">
					<TabsList className="gap-7 flex bg-transparent w-full justify-center">
						<TabsTrigger value="files">Your Files</TabsTrigger>
						<TabsTrigger value="summaries">Summarizer</TabsTrigger>
						<TabsTrigger value="grammar-checks">Grammar Checker</TabsTrigger>
						<TabsTrigger value="search-huggingface">Search For Models</TabsTrigger>
					</TabsList>
					<TabsContent value="files">
						<Dialog>
							<Header title="Dashboard">
								<UploadButton />
							</Header>
							<Files
								setSummaryFileId={setSummaryFileId}
								setDialogContent={setDialogContent}
								setGrammarCheckFileId={setGrammarCheckFileId}
							/>
							<DialogContent className="p-8 max-w-7xl w-full min-h-[calc(100vh-15rem)]">
								{dialogContent === "summary" ? (
									<Tabs
										className="grid grid-cols-[1fr_3fr] gap-6 items-start"
										defaultValue="summary-type"
									>
										<VTabsList className="bg-transparent h-full w-full justify-center gap-3">
											<VTabsTrigger value="long" className="text-lg">
												Long
											</VTabsTrigger>
											<VTabsTrigger value="medium" className="text-lg">
												Medium
											</VTabsTrigger>
											<VTabsTrigger value="short" className="text-lg">
												Short
											</VTabsTrigger>
										</VTabsList>
										<div className="w-full h-full flex">
											<TabsContent value="long" className="flex-1 h-full">
												<Summary batchSize={BatchSize.LONG} fileId={summaryFileId} />
											</TabsContent>
											<TabsContent value="medium" className="flex-1 h-full">
												<Summary batchSize={BatchSize.MEDIUM} fileId={summaryFileId} />
											</TabsContent>
											<TabsContent value="short" className="flex-1 h-full">
												<Summary batchSize={BatchSize.SHORT} fileId={summaryFileId} />
											</TabsContent>
										</div>
									</Tabs>
								) : dialogContent === "short-summary" ? (
									<ShortSummary fileId={summaryFileId} />
								) : (
									// <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
									<div className="max-h[calc(100vh-10rem)]">
										<GrammarCheckViewer fileId={grammarCheckFileId} />
									</div>
									// </SimpleBar>
								)}
							</DialogContent>
						</Dialog>
					</TabsContent>
					<TabsContent value="summaries">
						<SummaryFields />
					</TabsContent>
					<TabsContent value="grammar-checks">
						<GrammarCheckFields />
					</TabsContent>
					<TabsContent value="search-huggingface">
						<SearchPage />
					</TabsContent>
				</Tabs>
			</div>
		</main>
	);
};

interface SummaryProps {
	fileId: number | null;
	batchSize: BatchSize;
}

const ShortSummary = ({ fileId }: { fileId: number }) => {
	const { data: shortSummary } = useQuery({
		queryFn: () => getLatestShortSummary(fileId),
		queryKey: ["short-summary", fileId],
	});
	return (
		<div className="flex w-full h-full border border-gray-200 roudned-lg p-4">
			{shortSummary ? (
				<div>{shortSummary?.data?.summary}</div>
			) : (
				"Generate short summary first"
			)}
		</div>
	);
};

const Summary = ({ batchSize, fileId }: SummaryProps) => {
	const { data } = useQuery({
		queryFn: () => getFileSummary({ file_id: fileId, batchSize: batchSize }),
		queryKey: ["file_id", fileId, "batch_size", batchSize],
	});

	const { data: file_data } = useQuery({
		queryFn: () => getFile({ file_id: fileId }),
	});

	let timeTaken;
	if (data && data.data) {
		const timeDiff = new Date(data.data.updated_at) - new Date(data.data.created_at);
		console.log(timeDiff);
		timeTaken = msToTime(timeDiff);
	}

	const words = data?.data?.summary.trim().split(/\s+/);

	return (
		<div className="flex flex-col gap-2 h-full w-full">
			{data?.data ? (
				<>
					<div className="flex justify-between bg-gray-100 p-4 rounded-lg">
						<p className="font-semibold">{file_data?.data?.name}</p>
						<p>Time taken: {timeTaken}</p>
						<p>Word Count: {words?.length}</p>
					</div>
					<Textarea value={data.data.summary} rows={20} cols={20} readOnly />
				</>
			) : (
				<div className="flex items-center justify-center w-full h-full">
					<EmptyScreen text="" />
				</div>
			)}
		</div>
	);
};

const GrammarCheckViewer = ({ fileId }: { fileId: number | null }) => {
	const { data } = useQuery({
		queryFn: () => getGrammarCheck({ fileId }),
		queryKey: ["file_id", fileId, "grammar_check"],
	});

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

	return (
		<>
			{data?.data ? (
				<ReactDiffViewer
					oldValue={data?.data?.input_text}
					newValue={data?.data?.corrected_text}
					splitView={true}
					leftTitle={`Input Text`}
					rightTitle={`Grammar Checked`}
					styles={defaultStyles}
				/>
			) : (
				<div className="flex items-center justify-center w-full h-full">
					<EmptyScreen text="No grammar checks for this document found!!" />
				</div>
			)}
		</>
	);
};

export default Dashboard;
