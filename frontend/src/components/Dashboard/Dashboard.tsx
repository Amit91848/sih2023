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
							<Files setSummaryFileId={setSummaryFileId} />
							<DialogContent className="p-5 max-w-5xl w-full min-h-[calc(100vh-15rem)]">
								<Tabs
									className="grid grid-cols-[1fr_3fr] gap-6 items-start"
									defaultValue="summary-type"
								>
									<VTabsList className="bg-transparent bg-red-400 h-full w-full justify-center">
										<VTabsTrigger value="long">Long</VTabsTrigger>
										<VTabsTrigger value="medium">Medium</VTabsTrigger>
										<VTabsTrigger value="short">Short</VTabsTrigger>
									</VTabsList>
									<div className="w-full bg-green-400 h-full flex-1">
										<TabsContent value="long">
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

	console.log(data);
	return (
		<div className="p-7 ">
			{data?.data?.summary}
			{batchSize} {fileId}
		</div>
	);
};

export default Dashboard;
