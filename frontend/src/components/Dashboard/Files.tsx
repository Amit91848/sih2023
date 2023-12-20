import { deleteUserFile } from "@/api/file/deleteUserFile";
import { getUserFiles } from "@/api/file/getUserFiles";
import { summarizeFile, BatchSize, grammarCheckFile } from "@/api/file/summarizeFile";
import { IFile, Status } from "@/types";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { MessageSquareMore, MoreVertical, SpellCheck, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { EmptyScreen } from "../EmptyScreen";
import React from "react";
import { filesize } from "filesize";
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
import { Link } from "@/lib/navigation";
import { DialogTrigger } from "../ui/dialog";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { generateShortSummary } from "@/api/file/shortSummaryFile";

interface IFilesProps {
	setSummaryFileId: React.Dispatch<React.SetStateAction<number | null>>;
	setDialogContent: React.Dispatch<React.SetStateAction<string | null>>;
	setGrammarCheckFileId: React.Dispatch<React.SetStateAction<number | null>>;
}

export const Files = ({
	setSummaryFileId,
	setDialogContent,
	setGrammarCheckFileId,
}: IFilesProps) => {
	const { data: files, isLoading } = useQuery({
		queryKey: ["files"],
		queryFn: getUserFiles,
		refetchInterval: 5000,
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
							<File
								setSummaryFileId={setSummaryFileId}
								setDialogContent={setDialogContent}
								setGrammarCheckFileId={setGrammarCheckFileId}
								file={file}
								key={file.id}
							/>
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

interface FileProps {
	file: IFile;
	setSummaryFileId: React.Dispatch<React.SetStateAction<number | null>>;
	setDialogContent: React.Dispatch<React.SetStateAction<string | null>>;
	setGrammarCheckFileId: React.Dispatch<React.SetStateAction<number | null>>;
}

const File = ({
	file,
	setSummaryFileId,
	setDialogContent,
	setGrammarCheckFileId,
}: FileProps) => {
	const queryClient = useQueryClient();
	const { mutate: deleteFile } = useMutation({
		mutationFn: deleteUserFile,
		onSuccess() {
			queryClient.invalidateQueries(["files"]);
		},
	});

	const { mutate: generateSummary } = useMutation({
		mutationFn: summarizeFile,
		onMutate() {
			toast.success("Your requested summary is being generated!");
		},
		onSuccess() {
			queryClient.invalidateQueries(["files"]);
		},
	});

	const { mutate: grammarCheck, isLoading } = useMutation({
		mutationFn: grammarCheckFile,
		onSuccess() {
			queryClient.invalidateQueries(["files"]);
		},
	});

	const { mutate: callGenerateShortSummary, isLoading: shortSummaryLoading } =
		useMutation({
			mutationFn: generateShortSummary,
		});

	return (
		<>
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
									<DropdownMenu>
										<DropdownMenuTrigger>
											<MoreVertical />
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<Link
												href={{
													pathname: "/dashboard/file",
													query: { fileId: file.id },
												}}
											>
												<DropdownMenuItem className="cursor-pointer">
													<MessageSquareMore className="mr-2 h-4 w-4" />
													Chat With Doc
												</DropdownMenuItem>
											</Link>
											<DropdownMenuSeparator />
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
														? "Paraphrasing File"
														: "Paraphrase"}
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
												{/* <Dialog> */}
												<DialogTrigger
													onClick={() => {
														setSummaryFileId(file.id);
														setDialogContent("summary");
														console.log(file.id);
													}}
												>
													<p> View Paraphrases </p>
												</DialogTrigger>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => {
													console.log(file.id);
													callGenerateShortSummary(file.id);
												}}
												className="cursor-pointer"
											>
												{/* <Dialog> */}
												{/* <DialogTrigger */}

												<p> Generate Summary </p>
												{/* </DialogTrigger> */}
											</DropdownMenuItem>
											<DropdownMenuItem className="cursor-pointer">
												{/* <Dialog> */}
												<DialogTrigger
													onClick={() => {
														setSummaryFileId(file.id);
														setDialogContent("short-summary");
														console.log(file.id);
													}}
												>
													<p> View Summary </p>
												</DialogTrigger>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												// disabled={isLoading}
												className={"cursor-pointer"}
												onClick={() => {
													grammarCheck({ fileId: file.id });
												}}
											>
												Grammar Check
											</DropdownMenuItem>
											<DropdownMenuItem className="cursor-pointer">
												<SpellCheck className="mr-2 h-4 w-4" />

												<DialogTrigger
													onClick={() => {
														// setSummaryFileId(file.id);
														// console.log(file.id);
														setDialogContent("grammar-check");
														setGrammarCheckFileId(file.id);
														// grammarCheck({file_id: file.id})
													}}
												>
													View Grammar Check
												</DialogTrigger>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="cursor-pointer hover:!bg-red-500 hover:!text-white"
												onClick={() => deleteFile({ file_id: file.id })}
											>
												<Trash className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="px-6 mt-4 grid grid-cols-2 place-items-center py-2 gap-2">
					<div className="w-36">{filesize(file.size, { standard: "jedec" })}</div>
					<div className="w-44">
						{format(new Date(file.created_at), "h:mm do MMM yyyy")}
					</div>
					{/* <Button variant="ghost" className="w-full">
						View Summaries
					</Button>
					<div
						className={buttonVariants({
							variant: "ghost",
							size: "sm",
							className: "items-center flex gap-2 cursor-pointer",
						})}
					>
						<SpellCheck />
						View Grammar Check
					</div> */}
					{/* <DropdownMenuItem className="cursor-pointer">
												 <Dialog> 
												<DialogTrigger
													onClick={() => {
														setSummaryFileId(file.id);
														setDialogContent("summary");
														console.log(file.id);
													}}
												>
													<p> View Generated Summaries </p>
												</DialogTrigger>
											</DropdownMenuItem>
											<DropdownMenuItem className="cursor-pointer">
												<DialogTrigger
													onClick={() => {
														// setSummaryFileId(file.id);
														// console.log(file.id);
														setDialogContent("grammar-check");
													}}
												>
													<p> Grammar Check</p>
												</DialogTrigger>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												color="red"
												className="cursor-pointer font-semibold "
												onClick={() => deleteFile({ file_id: file.id })}
											>
												Delete
											</DropdownMenuItem> */}
					{/* <div className="flex items-center gap-2">
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
					</div> */}
				</div>
			</li>
		</>
	);
};
