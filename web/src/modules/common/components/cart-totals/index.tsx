"use client"

import { CATALOG_TRANSLATIONS, getLocaleFromCountry } from "@lib/i18n"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types/dist/bundles"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    items?: Array<HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem>
  }
  countryCode: string
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, countryCode }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
    items
  } = totals

  const locale = getLocaleFromCountry(countryCode)
  const copy = CATALOG_TRANSLATIONS[locale]

  function calculateSubTotal() {
    let subtotal = 0
    for (const item of items || []) {
      const rentalMetadata = item.metadata as Record<string, any> | undefined
      const isRental =
        rentalMetadata && rentalMetadata.rental_summary ? true : false
      if (isRental) {
          const rentalTotal =
            currency_code === "eur"
              ? rentalMetadata!["rental_eur_price"] *
                rentalMetadata!["rental_duration_days"] *
                item.quantity
              : rentalMetadata!["rental_usd_price"] *
                rentalMetadata!["rental_duration_days"] *
                item.quantity
          subtotal += rentalTotal
      } else {
        subtotal += item.subtotal
      }
    }
    return subtotal
  }

  const cartSubtotal = calculateSubTotal()

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>{copy.subTotal}</span>
          <span data-testid="cart-subtotal" data-value={cartSubtotal || 0}>
            {convertToLocale({ amount: cartSubtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>{copy.shipping}</span>
          <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>{copy.discount}</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center ">{copy.taxes}</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>{copy.total}</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: cartSubtotal ?? 0, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
