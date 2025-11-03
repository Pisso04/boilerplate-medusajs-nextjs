import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { CATALOG_TRANSLATIONS, getLocaleFromCountry } from "@lib/i18n"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const locale = getLocaleFromCountry(countryCode)
  const copy = CATALOG_TRANSLATIONS[locale]

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
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
      <div className="w-full space-y-6">
        <div className="mb-4">
          <h1 className="text-3xl font-semibold text-ui-fg-base" data-testid="store-page-title">
            {copy.heading}
          </h1>
          <p className="mt-2 text-ui-fg-subtle max-w-2xl">{copy.subheading}</p>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
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

export default StoreTemplate
