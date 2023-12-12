import ChatWrapper from "@/components/chat/ChatWrapper";
import PDFRenderer from "@/components/PDFRenderer";
import { useQuery } from "@tanstack/react-query";
import { getFile } from "@/api/file/getFile";
import { Loader } from "lucide-react";
import { useResizeDetector } from "react-resize-detector";

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
							<PDFRenderer url={file.data.url} childWidth={width} childRef={ref} />
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
