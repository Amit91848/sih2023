import { createLocalizedPathnamesNavigation, Pathnames } from "next-intl/navigation";

export const locales = ["en", "hin"] as const;
export const localePrefix = "always";

export const pathnames = {
	"/": "/",
	"/dashboard": "/dashboard",
	"/dashboard/file": "/dashboard/file",
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter, getPathname } =
	createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames });
