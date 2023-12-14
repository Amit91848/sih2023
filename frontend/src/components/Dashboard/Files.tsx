import { deleteUserFile } from "@/api/file/deleteUserFile";
import { getUserFiles } from "@/api/file/getUserFiles";
import { summarizeFile, BatchSize } from "@/api/file/summarizeFile";
import { Status } from "@/types";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreVertical, Plus, Loader2, Check, XCircle } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { EmptyScreen } from "../EmptyScreen";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Files = () => {
	const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<number | null>(
		null,
	);

	const queryClient = useQueryClient();

	const { data: files, isLoading } = useQuery({
		queryKey: ["files"],
		queryFn: getUserFiles,
		refetchInterval: 5000,
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

	const { mutate: generateSummary } = useMutation({
		mutationFn: summarizeFile,
		onSuccess() {
			queryClient.invalidateQueries(["files"]);
		},
	});
	return (
		<>
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
								<div
									// href={{ pathname: "/dashboard/file", query: { fileId: file.id } }}
									className="flex flex-col gap-2"
								>
									<div className="flex flex-col gap-2">
										<div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
											<div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
											<div className="flex-1 truncate">
												<div className="flex items-center justify-between ">
													<h3 className="truncate text-lg font-medium text-zinc-900">
														{file.name}
													</h3>
													{/* <Link
														href="/dashboard"
														className={buttonVariants({
															variant: "ghost",
															size: "sm",
														})}
													>
														<MoreVertical onClick={() => {}} />
													</Link> */}
													<DropdownMenu>
														<DropdownMenuTrigger>
															{/* <Button variant="ghost"> */}
															<MoreVertical />
															{/* </Button> */}
														</DropdownMenuTrigger>
														<DropdownMenuContent>
															<DropdownMenuItem className="cursor-pointer">
																Chat With Doc
															</DropdownMenuItem>

															<DropdownMenuSub>
																<DropdownMenuSubTrigger
																	disabled={
																		file.summary_status === Status.PROCESSING ||
																		file.summary_status === Status.PENDING
																	}
																	className={cn(
																		file.summary_status === Status.PROCESSING ||
																			file.summary_status === Status.PENDING
																			? "cursor-not-allowed text-gray-400"
																			: "cursor-pointer",
																	)}
																>
																	{file.summary_status === Status.PROCESSING ||
																	file.summary_status === Status.PENDING
																		? "Generating Summary"
																		: "Generate Summary"}
																</DropdownMenuSubTrigger>
																<DropdownMenuSubContent>
																	<DropdownMenuItem
																		className="cursor-pointer"
																		onClick={() =>
																			generateSummary({
																				fileId: file.id,
																				batchSize: BatchSize.LONG,
																			})
																		}
																	>
																		Long
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		className="cursor-pointer"
																		onClick={() => {
																			generateSummary({
																				fileId: file.id,
																				batchSize: BatchSize.MEDIUM,
																			});
																		}}
																	>
																		Medium
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		className="cursor-pointer"
																		onClick={() => {
																			generateSummary({
																				fileId: file.id,
																				batchSize: BatchSize.SHORT,
																			});
																		}}
																	>
																		Short
																	</DropdownMenuItem>
																</DropdownMenuSubContent>
															</DropdownMenuSub>
															<DropdownMenuItem className="cursor-pointer">
																Grammar Check
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																color="red"
																className="cursor-pointer font-semibold "
																onClick={() => deleteFile({ file_id: file.id })}
															>
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="px-6 mt-4 grid grid-cols-2 place-items-center py-2 gap-6 text-xs text-zinc-500">
									<div className="flex items-center gap-2">
										<Plus className="h-4 w-4" />
										{format(new Date(file.created_at), "MMM yyyy")}
									</div>

									<div className="flex items-center gap-2">
										{file.summary_status === Status.PENDING ||
										file.summary_status === Status.PROCESSING ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : file.summary_status === Status.SUCCESS ? (
											<>
												<Check className="text-green-600" /> Summary Generated
											</>
										) : (
											<XCircle className="text-red-600" />
										)}
									</div>
								</div>
							</li>
						))}
				</ul>
			) : isLoading ? (
				<Skeleton height={100} className="my-2" count={3} />
			) : (
				<EmptyScreen text="Let's upload your first PDF." />
			)}
		</>
	);
};
