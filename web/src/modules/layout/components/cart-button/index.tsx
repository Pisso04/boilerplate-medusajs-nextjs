import { retrieveCart } from "@lib/data/cart"
import CartDropdown from "../cart-dropdown"
import { SupportedLocale } from "@lib/i18n"

export default async function CartButton({countryCode}:{countryCode: string | undefined}) {
  const cart = await retrieveCart().catch(() => null)

  return <CartDropdown cart={cart} countryCode={countryCode}/>
}
