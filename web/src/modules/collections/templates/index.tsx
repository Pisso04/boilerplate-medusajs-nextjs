import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { CATALOG_TRANSLATIONS, getLocaleFromCountry } from "@lib/i18n"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const locale = getLocaleFromCountry(countryCode)
  const copy = CATALOG_TRANSLATIONS[locale]

  return (
    <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
      <RefinementList
        sortBy={sort}
        labels={{
          title: copy.sortBy,
          options: copy.sortOptions.map((option) => ({
            value: option.value,
            label: option.label,
          })),
        }}
      />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1>{collection.title}</h1>
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            locale={locale}
            viewDetailsLabel={copy.viewDetails}
            emptyState={copy.emptyState}
          />
        </Suspense>
      </div>
    </div>
  )
}
