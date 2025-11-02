import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { SupportedLocale } from "@lib/i18n"
import { sortProducts } from "@lib/util/sort-products"
import { Heading, Text } from "@medusajs/ui"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  locale,
  viewDetailsLabel,
  emptyState,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  locale: SupportedLocale
  viewDetailsLabel: string
  emptyState: {
    title: string
    description: string
  }
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const orderedProducts = sortProducts(
    products,
    sortBy ? sortBy : "created_at"
  )

  const totalPages =
    orderedProducts.length > 0
      ? Math.ceil(orderedProducts.length / PRODUCT_LIMIT)
      : 0

  const safePage =
    totalPages > 0 ? Math.min(Math.max(page, 1), totalPages) : 1

  const startIndex = (safePage - 1) * PRODUCT_LIMIT
  const paginatedProducts = orderedProducts.slice(
    startIndex,
    startIndex + PRODUCT_LIMIT
  )

  return (
    <>
      {paginatedProducts.length === 0 && (
        <div className="py-16 w-full text-center flex flex-col items-center gap-4">
          <Heading level="h2" className="text-2xl font-semibold">
            {emptyState.title}
          </Heading>
          <Text className="max-w-lg text-ui-fg-subtle">
            {emptyState.description}
          </Text>
        </div>
      )}
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {paginatedProducts.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview
                product={p}
                region={region}
                locale={locale}
                viewDetailsLabel={viewDetailsLabel}
              />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={safePage}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
