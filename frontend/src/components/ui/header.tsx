import * as React from "react";

interface HeaderProps {
	title: string;
	children?: React.ReactNode;
}

const Header = ({ title, children }: HeaderProps) => {
	return (
		<div className="mt-5 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
			<h1 className="mb-3 font-bold text-4xl text-gray-900">{title}</h1>

			{children}
		</div>
	);
};

export { Header };
