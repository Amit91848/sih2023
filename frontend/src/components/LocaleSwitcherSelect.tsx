"use client";

import { usePathname } from "@/lib/navigation";
import clsx from "clsx";
import { useSearchParams, useRouter } from "next/navigation";
import { ChangeEvent, ReactNode, useTransition } from "react";

type Props = {
	children: ReactNode;
	defaultValue: string;
	label: string;
};

export default function LocaleSwitcherSelect({ children, defaultValue, label }: Props) {
	const router = useRouter();

	const searchParams = useSearchParams();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();

	const allParams = {};
	for (const [key, value] of searchParams.entries()) {
		allParams[key] = value;
	}
	const urlSafeQueryString = new URLSearchParams(allParams).toString();

	function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
		const nextLocale = event.target.value;
		const nextUrl = `/${nextLocale}${pathname}?${urlSafeQueryString}`;
		console.log(nextUrl);
		startTransition(() => {
			router.push(nextUrl);
		});
	}
	return (
		<label
			className={clsx(
				"relative text-gray-400",
				isPending && "transition-opacity [&:disabled]:opacity-30",
			)}
		>
			<p className="sr-only">{label}</p>
			<select
				className="inline-flex appearance-none bg-transparent py-3 pl-2 pr-6"
				defaultValue={defaultValue}
				disabled={isPending}
				onChange={onSelectChange}
			>
				{children}
			</select>
			<span className="pointer-events-none absolute right-2 top-[8px]">⌄</span>
		</label>
	);
}
