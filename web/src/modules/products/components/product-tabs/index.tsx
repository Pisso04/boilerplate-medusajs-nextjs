"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { CATALOG_TRANSLATIONS, getLocaleFromCountry, SupportedLocale } from "@lib/i18n"
import { DroneFromProduct } from "types/drone-from-product"

type ProductTabsProps = {
  product: DroneFromProduct
  locale: SupportedLocale
}

const ProductTabs = ({ product, locale }: ProductTabsProps) => {
  const copy = CATALOG_TRANSLATIONS[locale]
  const tabs = [
    {
      label: copy.product_info_title,
      component: <ProductInfoTab product={product} locale={locale} />,
    },
    {
      label: copy.shippingAndReturns,
      component: <ShippingInfoTab locale={locale} />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product, locale }: ProductTabsProps) => {
  const copy = CATALOG_TRANSLATIONS[locale]
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">{copy.material}</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">{copy.country_of_origin}</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">{copy.type}</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">{copy.weight}</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">{copy.dimensions}</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = ({locale}: {locale: SupportedLocale}) => {
  const copy = CATALOG_TRANSLATIONS[locale]
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">{copy.fastDelivery}</span>
            <p className="max-w-sm">{copy.fastDeliveryDesc}</p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">{copy.simpleExchange}</span>
            <p className="max-w-sm">{copy.simpleExchangeDesc}</p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">{copy.easyReturns}</span>
            <p className="max-w-sm">{copy.easyReturnsDesc}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
