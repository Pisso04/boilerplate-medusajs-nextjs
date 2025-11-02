import { CATALOG_TRANSLATIONS, getLocaleFromCountry } from "@lib/i18n"
import { Heading, Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = ({countryCode}: {countryCode: string}) => {
  const locale = getLocaleFromCountry(countryCode)
  const copy = CATALOG_TRANSLATIONS[locale]
  return (
    <div className="py-48 px-2 flex flex-col justify-center items-start" data-testid="empty-cart-message">
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        {copy?.cart}
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        {copy?.emptyCartDesc}
      </Text>
      <div>
        <InteractiveLink href="/store">{copy?.exploreProducts}</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
