import { CATALOG_TRANSLATIONS, getLocaleFromCountry } from "@lib/i18n"
import { getPercentageDiff } from "@lib/util/get-precentage-diff"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
  countryCode: string
}

const LineItemPrice = ({
  item,
  style = "default",
  currencyCode,
  countryCode,
}: LineItemPriceProps) => {
  const { total, original_total } = item
  const originalPrice = original_total
  const currentPrice = total
  const hasReducedPrice = currentPrice < originalPrice

  const locale = getLocaleFromCountry(countryCode);
  const copy = CATALOG_TRANSLATIONS[locale];

  const rentalMetadata = item.metadata as Record<string, any> | undefined
  const rentalMetadataExist =
    rentalMetadata &&
    rentalMetadata.rental_summary ? true : false;
  const rentalTotal = currencyCode === "eur" ?  rentalMetadata!["rental_eur_price"] * rentalMetadata!["rental_duration_days"] * item.quantity : rentalMetadata!["rental_usd_price"] * rentalMetadata!["rental_duration_days"] * item.quantity;

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        {hasReducedPrice && !rentalMetadataExist && (
          <>
            <p>
              {style === "default" && (
                <span className="text-ui-fg-subtle">Original: </span>
              )}
              <span
                className="line-through text-ui-fg-muted"
                data-testid="product-original-price"
              >
                {convertToLocale({
                  amount: originalPrice,
                  currency_code: currencyCode,
                })}
              </span>
            </p>
            {style === "default" && (
              <span className="text-ui-fg-interactive">
                -{getPercentageDiff(originalPrice, currentPrice || 0)}%
              </span>
            )}
          </>
        )}
        <span
          className={clx("text-base-regular", {
            "text-ui-fg-interactive": hasReducedPrice,
          })}
          data-testid="product-price"
        >
          {convertToLocale({
            amount: !rentalMetadataExist ? currentPrice : rentalTotal,
            currency_code: currencyCode,
          })}
          {rentalMetadataExist && <span className="text-ui-fg-subtle"> - {rentalMetadata!["rental_duration_days"]} {copy.days }</span>}
        </span>
      </div>
    </div>
  )
}

export default LineItemPrice
