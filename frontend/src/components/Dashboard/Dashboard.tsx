"use client";

import React from "react";

// import Link from "next/link";
import UploadButton from "../UploadButton";
import { Header } from "../ui/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Files } from "./Files";
import { DataTable } from "../ui/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { Checkbox } from "../ui/checkbox";
import { DataTableFilterableColumn, DataTableSearchableColumn } from "@/types";

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
						<Files />
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

export default Dashboard;
