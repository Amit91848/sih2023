"use client";
import PdfChat from "@/components/PDFChat/PdfChat";
import { useSearchParams } from "next/navigation";

export default function Page() {
	const searchParams = useSearchParams();
	const fileId = searchParams.get("fileId");

	return <PdfChat fileId={fileId as string} />;
}
