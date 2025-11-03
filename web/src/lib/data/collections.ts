"use server"

import { sdk } from "@lib/config"
import { isConnectionError } from "@lib/util/is-connection-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (
  id: string
): Promise<HttpTypes.StoreCollection | null> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  try {
    const { collection } = await sdk.client.fetch<{
      collection: HttpTypes.StoreCollection
    }>(`/store/collections/${id}`, {
      next,
      cache: "force-cache",
    })

    return collection
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[data/collections] Failed to retrieve collection ${id}: fetch failed.`
      )
    }

    return null
  }
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  try {
    const { collections } = await sdk.client.fetch<{
      collections: HttpTypes.StoreCollection[]
      count: number
    }>("/store/collections", {
      query: queryParams,
      next,
      cache: "force-cache",
    })

    return { collections, count: collections.length }
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[data/collections] Failed to list collections: fetch failed. Returning empty list.`
      )
    }

    return { collections: [], count: 0 }
  }
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection | undefined> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  try {
    const { collections } =
      await sdk.client.fetch<HttpTypes.StoreCollectionListResponse>(
        `/store/collections`,
        {
          query: { handle, fields: "*products" },
          next,
          cache: "force-cache",
        }
      )

    return collections[0]
  } catch (error) {
    if (!isConnectionError(error)) {
      throw error
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[data/collections] Failed to fetch collection with handle "${handle}": fetch failed.`
      )
    }

    return undefined
  }
}
