import { model } from "@medusajs/framework/utils";

export const Drone = model.define("drone", {
  id: model.id().primaryKey(),
  marketing_method: model
    .enum(["sale", "rent", "sale_and_rent"])
    .default("sale"),
  rental_per_day_prices: model.json().nullable(), //ex ({ "eur": 50, "usd": 75,})
  translations: model.json().nullable(), //ex ({ "en": { title: "Product Title", description: "Product Description" } })
});
