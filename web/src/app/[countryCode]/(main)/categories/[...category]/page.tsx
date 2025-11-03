import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  try {
    const productCategories = await listCategories()

    if (!productCategories.length) {
      return []
    }

    const regions = await listRegions()

    const countryCodes = regions
      ?.map((region: StoreRegion) =>
        region.countries?.map((country) => country.iso_2)
      )
      .flat()
      .filter((code): code is string => Boolean(code))

    if (!countryCodes?.length) {
      return []
    }

    const handles = productCategories
      .map((category: any) => category.handle)
      .filter((handle): handle is string => Boolean(handle))

    if (!handles.length) {
      return []
    }

    return countryCodes.flatMap((countryCode) =>
      handles.map((handle) => ({
        countryCode,
        category: [handle],
      }))
    )
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[categories] Skipping static params: ${
          error instanceof Error ? error.message : "unknown error"
        }.`
      )
    }

    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    if (!productCategory) {
      notFound()
    }

    const title = productCategory.name + " | Drone Hub"

    const description = productCategory.description ?? `${title} category.`

    return {
      title: `${title} | Drone Hub`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
