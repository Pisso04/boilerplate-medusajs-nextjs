import { CATALOG_TRANSLATIONS, getLocaleFromCountry } from "@lib/i18n"
import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = ({countryCode}: {countryCode: string}) => {
  const locale = getLocaleFromCountry(countryCode)
  const copy = CATALOG_TRANSLATIONS[locale]
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          {copy.alreadyHaveAnAccount}
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          {copy.signInFor}
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10" data-testid="sign-in-button">
            {copy.signIn}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
