import { useLocale, useTranslations } from "next-intl";
import LocaleSwitcherSelect from "./LocaleSwitcherSelect";
import { locales } from "@/lib/navigation";

export default function LocaleSwitcher() {
	const t = useTranslations("Language");
	const locale = useLocale();
	return (
		<LocaleSwitcherSelect defaultValue={locale} label="Change location">
			{locales.map((cur) => (
				<option key={cur} value={cur}>
					{t("locale", { locale: cur })}
				</option>
			))}
		</LocaleSwitcherSelect>
	);
}
