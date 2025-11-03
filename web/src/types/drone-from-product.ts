import { HttpTypes } from "@medusajs/types"

export type DroneFromProduct = HttpTypes.StoreProduct & {
  drone?: {
    id: string
    marketing_method: string
    rental_per_day_prices: JSON
    translations: JSON
  }
}

enum DroneMarketingMethod {
  SALE = "sale",
  RENTAL = "rental",
  SALE_AND_RENTAL = "sale_and_rental",
}
