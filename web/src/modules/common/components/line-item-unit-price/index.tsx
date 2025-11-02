import { CATALOG_TRANSLATIONS, getLocaleFromCountry } from "@lib/i18n"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
  countryCode: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
  countryCode,
}: LineItemUnitPriceProps) => {
  const { total, original_total } = item
  const hasReducedPrice = total < original_total

  const locale = getLocaleFromCountry(countryCode)
  const copy = CATALOG_TRANSLATIONS[locale]

  const percentage_diff = Math.round(
    ((original_total - total) / original_total) * 100
  )

  const rentalMetadata = item.metadata as Record<string, any> | undefined
  const rentalMetadataExist =
    rentalMetadata && rentalMetadata.rental_summary ? true : false
  const rentalUnitPrice =
    currencyCode === "eur"
      ? rentalMetadata!["rental_eur_price"] * rentalMetadata!["rental_duration_days"]
      : rentalMetadata!["rental_usd_price"] * rentalMetadata!["rental_duration_days"]

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {hasReducedPrice && !rentalMetadataExist && (
        <>
          <p>
            {style === "default" && (
              <span className="text-ui-fg-muted">Original: </span>
            )}
            <span
              className="line-through"
              data-testid="product-unit-original-price"
            >
              {convertToLocale({
                amount: original_total / item.quantity,
                currency_code: currencyCode,
              })}
            </span>
          </p>
          {style === "default" && (
            <span className="text-ui-fg-interactive">-{percentage_diff}%</span>
          )}
        </>
      )}
      <span
        className={clx("text-base-regular", {
          "text-ui-fg-interactive": hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {convertToLocale({
          amount: !rentalMetadataExist ? total / item.quantity : rentalUnitPrice,
          currency_code: currencyCode,
        })}
        {rentalMetadataExist && <span className="text-ui-fg-subtle"> - {rentalMetadata!["rental_duration_days"]} {copy.days}</span>}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
