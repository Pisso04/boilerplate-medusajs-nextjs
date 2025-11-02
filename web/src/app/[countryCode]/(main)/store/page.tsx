import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { CATALOG_TRANSLATIONS, getLocaleFromCountry } from "@lib/i18n"

export async function generateMetadata(props: {
  params: Promise<{
    countryCode: string
  }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  const locale = getLocaleFromCountry(countryCode)
  const copy = CATALOG_TRANSLATIONS[locale]
  
  return {
    title: copy.heading,
    description: copy.subheading,
  }
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
