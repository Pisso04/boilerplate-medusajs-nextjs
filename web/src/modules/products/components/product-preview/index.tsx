import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { SupportedLocale } from "@lib/i18n"
import { DroneFromProduct } from "types/drone-from-product"
import ProductInfo from "@modules/products/templates/product-info"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  locale,
  viewDetailsLabel,
}: {
  product: DroneFromProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  locale?: SupportedLocale
  viewDetailsLabel?: string
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const displayTitle = product.title
  const displayDescription = product.description ?? ""

  const productInfos = locale === "en"
    ? (product.drone?.translations as Record<string, any> | undefined)?.["en"]
    : (product.drone?.translations as Record<string, any> | undefined)?.["fr"];


  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div
        data-testid="product-wrapper"
        className="flex flex-col gap-3 h-full justify-between"
      >
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex flex-col gap-2 mt-4 flex-1">
          <div className="flex txt-compact-medium justify-between">
            <Text className="text-ui-fg-base" data-testid="product-title">
              {displayTitle}
            </Text>
            {/* <div className="flex items-center gap-x-2">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div> */}
          </div>
          {displayDescription && (
            <Text className="text-ui-fg-subtle text-small-regular line-clamp-3">
              {productInfos?.description || displayDescription}
            </Text>
          )}
          <Text className="text-ui-fg-interactive text-small-regular group-hover:underline">
            {viewDetailsLabel ?? "View details"}
          </Text>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
