import { sdk } from "@lib/config"
import { isConnectionError } from "@lib/util/is-connection-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  try {
    const { product_categories } =
      await sdk.client.fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
        "/store/product-categories",
        {
          query: {
            fields:
              "*category_children, *products, *parent_category, *parent_category.parent_category",
            limit,
            ...query,
          },
          next,
          cache: "force-cache",
        }
      )

    return product_categories
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[data/categories] Failed to list categories: fetch failed. Returning empty list.`
      )
    }

    return []
  }
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  try {
    const { product_categories } =
      await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            fields: "*category_children, *products",
            handle,
          },
          next,
          cache: "force-cache",
        }
      )

    return product_categories[0]
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[data/categories] Failed to fetch category "${handle}": fetch failed.`
      )
    }

    return undefined
  }
}
