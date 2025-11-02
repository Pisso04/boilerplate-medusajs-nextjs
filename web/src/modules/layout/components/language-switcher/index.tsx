"use client"

import { useMemo, useTransition } from "react"

import { getLocaleFromCountry, LANGUAGE_OPTIONS } from "@lib/i18n"
import { updateRegion } from "@lib/data/cart"
import { useParams, usePathname } from "next/navigation"

const LanguageSwitcher = () => {
  const { countryCode } = useParams()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const currentLocale = useMemo(
    () => getLocaleFromCountry(countryCode as string | undefined),
    [countryCode]
  )

  const currentPath =
    pathname && countryCode
      ? pathname.split(`/${countryCode}`)[1] || ""
      : pathname

  const handleChange = (locale: string) => {
    const option = LANGUAGE_OPTIONS.find((opt) => opt.locale === locale)
    if (!option) {
      return
    }

    startTransition(async () => {
      await updateRegion(option.countryCode, currentPath ?? "")
    })
  }

  const label = currentLocale === "fr" ? "Langue" : "Language"

  return (
    <label className="flex items-center gap-2 text-ui-fg-subtle text-small-regular">
      <span className="hidden small:inline">{label}</span>
      <select
        className="border border-ui-border-base rounded-rounded py-1 px-2 bg-white text-ui-fg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-border-strong"
        value={currentLocale}
        onChange={(event) => handleChange(event.target.value)}
        disabled={isPending}
        aria-label="Language selector"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.locale} value={option.locale}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default LanguageSwitcher
