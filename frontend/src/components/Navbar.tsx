"use client";
// import Link from "next/link";
import { Link } from "@/lib/navigation";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button, buttonVariants } from "./ui/button";
import LocaleSwitcher from "./LocaleSwitcher";
import { useQuery } from "@tanstack/react-query";
import { getComputeInfo } from "@/api/compute/getCompute";
import { ChevronDown } from "lucide-react";

const Navbar = () => {
	const { data: compute } = useQuery({
		refetchInterval: 700,
		queryKey: ["compute"],
		queryFn: getComputeInfo,
	});

	return (
		<nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all fon">
			<MaxWidthWrapper>
				<div className="flex h-14 items-center justify-between border-b border-zinc-200">
					<Link href="/" className="flex z-40 font-semibold">
						<span className="text-3xl">Prakat</span>
					</Link>

					{/* <MobileNav isAuth={!!user} /> */}
					<div className="mx-11 flex flex-1 ">
						<div className=" text-xs font-semibold text-gray-800 px-4 flex flex-col ">
							<div className="whitespace-nowrap">RAM: {compute?.data?.ram} MB</div>
							<div className="whitespace-nowrap">CPU: {compute?.data?.cpu} %</div>
						</div>
						<div className="w-full text-center border-gray-300 border bg-gray-200 rounded-lg flex items-center justify-center">
							<Button variant="ghost" className="w-full ">
								{compute?.data?.model_name
									? compute.data.model_name
									: "No model loaded"}
								<ChevronDown width={2} height={2} />
							</Button>
						</div>
					</div>

					<div className="hidden items-center space-x-4 sm:flex">
						<Link
							href="/dashboard"
							className={buttonVariants({
								variant: "ghost",
								size: "sm",
							})}
						>
							Dashboard
						</Link>
						<LocaleSwitcher />
					</div>
				</div>
			</MaxWidthWrapper>
		</nav>
	);
};

export default Navbar;
