import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  try {
    const { collections } = await listCollections({
      fields: "*products",
    })

    if (!collections.length) {
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

    const handles = collections
      .map((collection: StoreCollection) => collection.handle)
      .filter((handle): handle is string => Boolean(handle))

    if (!handles.length) {
      return []
    }

    return countryCodes.flatMap((countryCode) =>
      handles.map((handle) => ({
        countryCode,
        handle,
      }))
    )
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[collections] Skipping static params: ${
          error instanceof Error ? error.message : "unknown error"
        }.`
      )
    }

    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | Drone Hub`,
    description: `${collection.title} collection`,
  } as Metadata

  return metadata
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
    />
  )
}
