import { Ghost } from "lucide-react";

interface EmptyScreenProps {
	text: string;
}

export const EmptyScreen = ({ text }: EmptyScreenProps) => {
	return (
		<div className="mt-16 flex flex-col items-center gap-2">
			<Ghost className="h-8 w-8 text-zinc-800" />
			<h3 className="font-semibold text-xl">Pretty empty around here</h3>
			<p>{text}</p>
		</div>
	);
};
