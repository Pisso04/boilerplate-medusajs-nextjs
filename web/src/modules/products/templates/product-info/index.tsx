import { getLocaleFromCountry } from "@lib/i18n"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DroneFromProduct } from "types/drone-from-product"

type ProductInfoProps = {
  product: DroneFromProduct
  countryCode?: string
}

const ProductInfo = ({ product, countryCode }: ProductInfoProps) => {
  const locale = getLocaleFromCountry(countryCode || "us");
  
  const productInfos =
    locale === "en"
      ? (product.drone?.translations as Record<string, any> | undefined)?.["en"]
      : (product.drone?.translations as Record<string, any> | undefined)?.["fr"]

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {productInfos.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
