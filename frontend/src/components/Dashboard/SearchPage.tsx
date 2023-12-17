import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { IModel, getSearchModelName } from "@/api/huggingface/getSearchModelLists";
import { Badge } from "../ui/badge";
import { Heart, MoveDown } from "lucide-react";
import { cn } from "@/lib/utils";
import SimpleBar from "simplebar-react";
import { getModelInfo } from "@/api/huggingface/getModelInfo";
import { filesize } from "filesize";

export const SearchPage = () => {
	const [searchInput, setSearchInput] = useState("");
	const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

	const { data: model_list, refetch } = useQuery({
		queryKey: ["models-list", searchInput],
		queryFn: () => getSearchModelName(searchInput),
		enabled: false,
	});
	return (
		<div>
			<div className="mt-2 w-1/2 mx-auto flex items-center justify-center gap-8">
				<Input
					placeholder="🔍 Search for models by keywords or paste huggingface repo url..."
					value={searchInput}
					onChange={(e) => setSearchInput(e.currentTarget.value)}
				/>
				<Button onClick={() => refetch()}>Go</Button>
			</div>
			<div className="mt-5 flex gap-4">
				<div className="w-1/2 ">
					<SimpleBar autoHide={false}>
						<ul className="flex flex-col gap-3 overflow-scroll h-[35rem]">
							{model_list?.data?.map((model) => (
								<Model
									setSelectedModelId={setSelectedModelId}
									selectedModelId={selectedModelId}
									model={model}
									key={model.id}
								/>
							))}
						</ul>
					</SimpleBar>
				</div>
				<div className="w-1/2">
					<SelectedModel modelId={selectedModelId} />
				</div>
			</div>
		</div>
	);
};

const SelectedModel = ({ modelId }: { modelId: string | null }) => {
	const { data: modelInfo } = useQuery({
		queryKey: ["model-info", modelId],
		queryFn: () => getModelInfo(modelId),
	});
	return (
		<div className="h-full flex flex-col border border-gray-400 rounded-lg">
			<div className="h-16 flex items-center justify-between p-6 border-b border-gray-400">
				<div className="flex gap-3">
					<Badge variant="outline">{modelInfo?.data?.config.model_type || ""}</Badge>
					<Badge variant="outline">B</Badge>
					<Badge variant="outline">
						{modelInfo?.data?.config &&
						modelInfo.data.config.quantization_config &&
						modelInfo.data.config.quantization_config.quant_method
							? modelInfo.data.config.quantization_config.quant_method
							: ""}
					</Badge>
					<div>{modelInfo?.data?.id || ""}</div>
				</div>
				<div>Model Card</div>
			</div>
			<div className="h-4 flex p-5 items-center border-b border-gray-400">
				{" "}
				Available Files
			</div>
			<div className="">
				<ul>
					{modelInfo?.data?.siblings.map(
						(sibling) =>
							sibling.lfs !== null && (
								<li
									className="flex justify-between p-4 items-center"
									key={sibling.rfilename}
								>
									<div>{sibling.rfilename}</div>
									<div className="flex gap-4 items-center">
										<div>{filesize(sibling.size, { standard: "jedec" })}</div>
										<div>
											<Button>
												Download
												<MoveDown width="14" height="14" />
											</Button>
										</div>
									</div>
								</li>
							),
					)}
				</ul>
			</div>
		</div>
	);
};

const Model = ({
	model,
	setSelectedModelId,
	selectedModelId,
}: {
	selectedModelId: string;
	model: IModel;
	setSelectedModelId: Dispatch<SetStateAction<string | null>>;
}) => {
	return (
		<li
			onClick={() => setSelectedModelId(model.id)}
			className={cn(
				model.id === selectedModelId && "bg-gray-200",
				"p-3 flex justify-between border border-gray-300 rounded-lg cursor-pointer hover:border-gray-800",
			)}
		>
			<div className="flex gap-2">
				<Badge variant="outline">
					<div className="flex gap-1 items-center justify-center">
						<MoveDown width="14" height="14" />
						{model.downloads}
					</div>
				</Badge>
				<Badge variant="outline">
					<div className="flex gap-1 items-center justify-center">
						<Heart width="14" height="14" />
						{model.likes}
					</div>
				</Badge>
				<div>{model.id} </div>
			</div>
			<div>
				<Badge variant="outline">
					<div className="flex gap-1 items-center justify-center">
						{/* <MoveDown width="14" height="14" /> */}
						{model.last_modified}
					</div>
				</Badge>
			</div>
		</li>
	);
};
