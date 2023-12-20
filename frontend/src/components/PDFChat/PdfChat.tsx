import ChatWrapper from "@/components/chat/ChatWrapper";
import PDFRenderer from "@/components/PDFRenderer";
import { useQuery } from "@tanstack/react-query";
import { getFile } from "@/api/file/getFile";
import { Loader } from "lucide-react";
import { useResizeDetector } from "react-resize-detector";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import Image from "next/image";
import SimpleBar from "simplebar-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface PageProps {
	fileId: string;
}
const PdfChat = ({ fileId: file_id }: PageProps) => {
	const { data: file, isLoading } = useQuery({
		queryFn: () => getFile({ file_id: parseInt(file_id) }),
		queryKey: [`file-${file_id}`],
	});

	const { width, ref } = useResizeDetector();

	return (
		<div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
			{isLoading ? (
				<Loader />
			) : (
				<div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
					{/* Left sidebar & main wrapper */}
					<div className="flex-1 xl:flex">
						<div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
							{/* Main area */}
							{file?.data?.isPdf ? (
								<PDFRenderer
									url={
										file?.data?.isLocal ? convertFileSrc(file.data.url) : file.data.url
									}
									childWidth={width}
									childRef={ref}
								/>
							) : (
								<div className="max-h-[calc(100vh-10rem)] w-full flex justify-center">
									<Tabs defaultValue="ocr-processed" className="w-full">
										<SimpleBar className="max-h-[calc(100vh-10rem)]">
											<TabsList className=" flex bg-transparent justify-center">
												<TabsTrigger value="ocr-processed">Original Image</TabsTrigger>
												<TabsTrigger value="ocr-original">Processed Image</TabsTrigger>
												<TabsTrigger value="ocr-text">View Extracted Text</TabsTrigger>
											</TabsList>
											<TabsContent value="ocr-processed">
												<Image
													className="w-full"
													width="100"
													height="100"
													src={convertFileSrc(file?.data.url)}
													alt={file?.data?.name || ""}
												/>
											</TabsContent>
											<TabsContent value="ocr-original">
												<Image
													className="w-full"
													width="100"
													height="100"
													src={convertFileSrc(file?.data?.ocrOgImage)}
													alt={file?.data?.name || ""}
												/>
											</TabsContent>
											<TabsContent value="ocr-text">{file?.data?.ocrText}</TabsContent>
										</SimpleBar>
									</Tabs>
								</div>
							)}
						</div>
					</div>
					<div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
						<ChatWrapper fileId={file.data.id.toString()} />
					</div>
				</div>
			)}
		</div>
	);
};

export default PdfChat;
