import { cn } from "@/lib/utils";
import React from "react";

type Props = {
	className?: string;
	children: React.ReactNode;
};

const MaxWidthWrapper = ({ className, children }: Props) => {
	return (
		<div className={cn("mx-auto w-full max-w-[1300px] px-2.5 md:px-20", className)}>
			{children}
		</div>
	);
};

export default MaxWidthWrapper;
