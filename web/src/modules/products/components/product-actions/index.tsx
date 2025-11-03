"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button, Input } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { DroneFromProduct } from "types/drone-from-product"
import { CATALOG_TRANSLATIONS, getLocaleFromCountry } from "@lib/i18n"

type ProductActionsProps = {
  product: DroneFromProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [showRentalForm, setShowRentalForm] = useState(false)
  const [rentalStart, setRentalStart] = useState("")
  const [rentalEnd, setRentalEnd] = useState("")
  const [isAddingRental, setIsAddingRental] = useState(false)
  const countryCode = useParams().countryCode as string
  const locale = getLocaleFromCountry(countryCode)
  const copy = CATALOG_TRANSLATIONS[locale]

  const rentalPrice = locale === "en"
    ? (product.drone?.rental_per_day_prices as Record<string, any> | undefined)?.["usd"]
    : (product.drone?.rental_per_day_prices as Record<string, any> | undefined)?.["eur"];

  const rentalEurPrice = (product.drone?.rental_per_day_prices as Record<string, any> | undefined)?.["eur"];
  const rentalUsdPrice = (product.drone?.rental_per_day_prices as Record<string, any> | undefined)?.["usd"];

  const marketingMethod = product.drone?.marketing_method;
  const isRental = marketingMethod === "rent" || marketingMethod === "sale_and_rent";
  const isSale = marketingMethod === "sale" || marketingMethod === "sale_and_rent";

  const getLocalDateString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000
    const localTime = new Date(date.getTime() - tzOffset)

    return localTime.toISOString().split("T")[0]
  }

  const today = useMemo(() => getLocalDateString(new Date()), [])

  const parseDateValue = (value: string) => {
    if (!value) {
      return null
    }

    const [year, month, day] = value.split("-").map(Number)

    if (
      !year ||
      Number.isNaN(year) ||
      !month ||
      Number.isNaN(month) ||
      !day ||
      Number.isNaN(day)
    ) {
      return null
    }

    return new Date(year, month - 1, day)
  }


  const rentalDurationDays = useMemo(() => {
    const startDate = parseDateValue(rentalStart)
    const endDate = parseDateValue(rentalEnd)

    if (!startDate || !endDate) {
      return 0
    }

    const msPerDay = 1000 * 60 * 60 * 24
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay)

    return diff > 0 ? diff : 0
  }, [rentalStart, rentalEnd])

  const formatCurrency = useMemo(() => {
    if (!region?.currency_code) {
      return (amount: number) => amount.toFixed(2)
    }

    return (amount: number) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: region.currency_code,
      }).format(amount)
  }, [locale, region?.currency_code])

  const rentalTotal = useMemo(() => {
    if (
      rentalDurationDays <= 0
    ) {
      return null
    }

    return rentalPrice * rentalDurationDays
  }, [rentalDurationDays])

  const rentalSummary = useMemo(() => {
    if (
      rentalTotal === null ||
      rentalTotal === undefined ||
      rentalDurationDays <= 0
    ) {
      return null
    }

    return `${formatCurrency(rentalTotal)} · ${rentalDurationDays} ${
      rentalDurationDays > 1 ? "days" : "day"
    }`
  }, [formatCurrency, rentalDurationDays, rentalTotal])

  const rentalDailyRateLabel = useMemo(() => {
    return formatCurrency(rentalPrice)
  }, [formatCurrency])

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])


  const isRentalFormValid = useMemo(() => {
    return (
      !!selectedVariant &&
      rentalDurationDays > 0 &&
      rentalTotal !== null &&
      rentalTotal !== undefined &&
      inStock &&
      !disabled
    )
  }, [
    disabled,
    inStock,
    rentalDurationDays,
    rentalTotal,
    selectedVariant,
  ])

  const rentalActionDisabled =
    !isRental ||
    !selectedVariant ||
    !isValidVariant ||
    !inStock ||
    !!disabled ||
    isAdding ||
    isAddingRental

  const actionsRef = useRef<HTMLDivElement>(null)

  const handleShowRentalForm = () => {
    setShowRentalForm(true)
    actionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    setIsAdding(false)
  }

  const handleAddRentalToCart = async () => {
    if (!selectedVariant?.id || !isRentalFormValid) {
      return null
    }

    setIsAddingRental(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
        metadata: {
          rental_start_date: rentalStart,
          rental_end_date: rentalEnd,
          rental_summary: rentalSummary,
          rental_total: rentalTotal,
          rental_eur_price: rentalEurPrice,
          rental_usd_price: rentalUsdPrice,
          rental_duration_days: rentalDurationDays,
          locale,
        },
      })

      setRentalStart("")
      setRentalEnd("")
      setShowRentalForm(false)
    } finally {
      setIsAddingRental(false)
    }
  }

  

  return (
    <>
      <div className="flex flex-col gap-y-4" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding || isAddingRental}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        {isSale && (
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className="w-full h-10"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant && !options
              ? "Select variant"
              : !inStock || !isValidVariant
              ? copy.outOfStock
              : copy.addToCart}
          </Button>
        )}

        {isRental && (
          <div className="flex flex-col gap-y-3 border border-ui-border-base rounded-rounded p-4">
            <div className="flex flex-col gap-y-1">
              <span className="text-base-regular font-semibold text-ui-fg-base">
                {copy.rental}
              </span>
              {rentalDailyRateLabel && (
                <span className="text-small-regular text-ui-fg-subtle">
                  {copy.dailyRate} {rentalDailyRateLabel}
                </span>
              )}
            </div>

            {!showRentalForm ? (
              <Button
                variant="secondary"
                onClick={handleShowRentalForm}
                disabled={rentalActionDisabled}
                className="w-full"
              >
                {copy.startRental}
              </Button>
            ) : (
              <div className="flex flex-col gap-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-y-1">
                    <span className="text-small-regular text-ui-fg-subtle">
                      {copy.startDate}
                    </span>
                    <Input
                      type="date"
                      value={rentalStart}
                      min={today}
                      max={rentalEnd || undefined}
                      onChange={(event) => {
                        const newStart = event.target.value
                        setRentalStart(newStart)

                        if (rentalEnd && newStart > rentalEnd) {
                          setRentalEnd("")
                        }
                      }}
                      disabled={!!disabled || isAddingRental}
                    />
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-small-regular text-ui-fg-subtle">
                      {copy.endDate}
                    </span>
                    <Input
                      type="date"
                      value={rentalEnd}
                      min={rentalStart || today}
                      onChange={(event) => setRentalEnd(event.target.value)}
                      disabled={!!disabled || isAddingRental}
                    />
                  </div>
                </div>

                {rentalSummary && (
                  <span className="text-small-regular text-ui-fg-base">
                    {rentalSummary}
                  </span>
                )}

                <div className="flex flex-col gap-y-2 sm:flex-row sm:items-center sm:gap-x-3">
                  <Button
                    onClick={handleAddRentalToCart}
                    disabled={!isRentalFormValid || isAddingRental}
                    isLoading={isAddingRental}
                    className="w-full sm:w-auto"
                  >
                    {copy.addRentalToCart}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowRentalForm(false)
                      setRentalStart("")
                      setRentalEnd("")
                    }}
                    disabled={isAddingRental}
                    className="w-full sm:w-auto"
                  >
                    {copy.cancel}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding || isAddingRental}
          isRental={isRental}
          onShowRentalForm={handleShowRentalForm}
          rentalButtonDisabled={rentalActionDisabled}
          locale={locale}
        />
      </div>
    </>
  )
}
