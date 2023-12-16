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
import { DataTable } from "../ui/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { Checkbox } from "../ui/checkbox";
import { DataTableFilterableColumn, DataTableSearchableColumn } from "@/types";
import { Dialog, DialogContent } from "../ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SimpleBar from "simplebar-react";
import { BatchSize } from "@/api/file/summarizeFile";
import { getFileSummary } from "@/api/file/getFileSummary";
import ReactDiffViewer from "react-diff-viewer-continued";
import { getFile } from "@/api/file/getFile";
import { msToTime } from "@/lib/utils";

enum DiffMethod {
	CHARS = "diffChars",
	WORDS = "diffWords",
	WORDS_WITH_SPACE = "diffWordsWithSpace",
	LINES = "diffLines",
	TRIMMED_LINES = "diffTrimmedLines",
	SENTENCES = "diffSentences",
	CSS = "diffCss",
}

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
	const [dialogContent, setDialogContent] = useState<string | null>(null);

	const oldCode = `
	const a = 10
	const b = 10
	const c = () => console.log('foo')
	
	if(a > 10) {
		console.log('bar')
	}
	
	console.log('done')
	`;
	const newCode = `
	const a = 10
	const boo = 10
	
	if(a === 10) {
		console.log('bar')
	}
	`;

	return (
		<main className="mx-auto max-w-7xl md:p-10">
			<Header title="Dashboard">
				<UploadButton />
			</Header>

			{/* display all user files */}
			<div className="flex mt-4 justify-center">
				<Tabs defaultValue="files">
					<TabsList className="flex bg-transparent w-full justify-center">
						<TabsTrigger value="files">Files</TabsTrigger>
						<TabsTrigger value="summaries">Your Summaries</TabsTrigger>
						<TabsTrigger value="grammer-checks">Your Grammer Checks</TabsTrigger>
					</TabsList>
					<TabsContent value="files">
						<Dialog>
							<Files
								setSummaryFileId={setSummaryFileId}
								setDialogContent={setDialogContent}
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
											<TabsContent value="medium">
												<Summary batchSize={BatchSize.MEDIUM} fileId={summaryFileId} />
											</TabsContent>
											<TabsContent value="short">
												<Summary batchSize={BatchSize.SHORT} fileId={summaryFileId} />
											</TabsContent>
										</div>
									</Tabs>
								) : (
									// <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
									<div className="overflow-scroll max-h-[calc(100vh-10rem)]">
										<ReactDiffViewer
											oldValue={oldCode}
											newValue={newCode}
											splitView={true}
											leftTitle={`Input Text`}
											rightTitle={`Grammar Checked`}
										/>
									</div>
									// </SimpleBar>
								)}
							</DialogContent>
						</Dialog>
					</TabsContent>
					<TabsContent value="summaries">
						<DataTable
							columns={columns}
							dataTable={dataTable}
							deleteRowsAction={(e) => console.log(e)}
						/>
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
		<div className="flex flex-col gap-2">
			<div className="flex justify-between bg-gray-100 p-4 rounded-lg">
				<p className="font-semibold">{file_data?.data?.name}</p>
				<p>Time taken: {timeTaken}</p>
				<p>Word Count: {words?.length}</p>
			</div>
			<div className="border border-gray-300 p-4 rounded-lg flex-1 h-full">
				{data?.data?.summary}
				{batchSize} {fileId}
			</div>
		</div>
	);
};

export default Dashboard;
