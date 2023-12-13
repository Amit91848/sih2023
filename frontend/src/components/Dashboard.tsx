"use client";

import { Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import React, { useState } from "react";
import Skeleton from "react-loading-skeleton";

// import Link from "next/link";
import { Link } from "@/lib/navigation";
import { Button } from "./ui/button";
import UploadButton from "./UploadButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "./ui/header";
import { getUserFiles } from "@/api/file/getUserFiles";
import { format } from "date-fns";
import { deleteUserFile } from "@/api/file/deleteUserFile";
import { EmptyScreen } from "./EmptyScreen";

const Dashboard = () => {
	const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<number | null>(
		null,
	);
	const queryClient = useQueryClient();

	const { data: files, isLoading } = useQuery({
		queryKey: ["files"],
		queryFn: getUserFiles,
	});

	const { mutate: deleteFile } = useMutation({
		mutationFn: deleteUserFile,
		onMutate({ file_id }) {
			setCurrentlyDeletingFile(file_id);
		},
		onSettled() {
			setCurrentlyDeletingFile(null);
		},
		onSuccess() {
			queryClient.invalidateQueries(["files"]);
		},
	});

	return (
		<main className="mx-auto max-w-7xl md:p-10">
			<Header title="My Files">
				<UploadButton />
			</Header>

			{/* display all user files */}
			{files?.data && files?.data.length !== 0 ? (
				<ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
					{files.data
						.sort(
							(a, b) =>
								new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
						)
						.map((file) => (
							<li
								key={file.id}
								className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
							>
								<Link
									href={{ pathname: "/dashboard/file", query: { fileId: file.id } }}
									className="flex flex-col gap-2 cursor-pointer"
								>
									<div className="flex flex-col gap-2">
										<div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
											<div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
											<div className="flex-1 truncate">
												<div className="flex items-center space-x-3">
													<h3 className="truncate text-lg font-medium text-zinc-900">
														{file.name}
													</h3>
												</div>
											</div>
										</div>
									</div>
								</Link>

								<div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
									<div className="flex items-center gap-2">
										<Plus className="h-4 w-4" />
										{format(new Date(file.created_at), "MMM yyyy")}
									</div>

									<div className="flex items-center gap-2">
										<MessageSquare className="h-4 w-4" />
										mocked
									</div>

									<Button
										onClick={() => deleteFile({ file_id: file.id })}
										size="sm"
										className="w-full"
										variant="destructive"
									>
										{currentlyDeletingFile === file.id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Trash className="h-4 w-4" />
										)}
									</Button>
								</div>
							</li>
						))}
				</ul>
			) : isLoading ? (
				<Skeleton height={100} className="my-2" count={3} />
			) : (
				<EmptyScreen text="Let's upload your first PDF." />
			)}
		</main>
	);
};

export default Dashboard;
