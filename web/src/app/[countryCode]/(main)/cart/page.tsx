import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { CATALOG_TRANSLATIONS, getLocaleFromCountry } from "@lib/i18n"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata(props: {
  params: Promise<{
    countryCode: string
  }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  const locale = getLocaleFromCountry(countryCode)
  const copy = CATALOG_TRANSLATIONS[locale]
  
  return {
    title: copy.cart,
    description: copy.viewYourCart,
  }
}

type Params = {
  params: Promise<{
    countryCode: string
  }>
}

export default async function Cart(props: Params) {
  const params = await props.params
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()

  return <CartTemplate cart={cart} customer={customer} countryCode={params.countryCode} />
}
