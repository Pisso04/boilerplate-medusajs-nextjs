import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { createDroneFromProductWorkflow } from "../workflows/create_drone_from_product";

const EUROPEAN_COUNTRIES = ["fr", "de", "es", "it", "gb"];
const NORTH_AMERICA_COUNTRIES = ["us"];

export default async function seedMultiCurrencyStore({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);
  const regionService = container.resolve(Modules.REGION);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const apiKeyService = container.resolve(Modules.API_KEY);
  const inventoryModuleService = container.resolve("inventory");

  logger.info("Starting demo data seeding...");

  const [store] = await storeModuleService.listStores();

  // --- SALES CHANNEL ---
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels(
    {
      name: "Drone hub Channel",
    }
  );

  if (!defaultSalesChannel.length) {
    logger.info("Creating default sales channel...");
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [{ name: "Drone hub Channel" }],
      },
    });
    defaultSalesChannel = salesChannelResult;
  } else {
    logger.info("Sales channel already exists, skipping.");
  }

  // --- STORE SETTINGS ---
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          { currency_code: "eur", is_default: true },
          { currency_code: "usd" },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  // --- REGIONS ---
  logger.info("Checking existing regions...");
  const existingRegions = await regionService.listRegions();
  if (existingRegions.length === 0) {
    logger.info("Creating regions for EUR and USD...");
    const { result: regionResult } = await createRegionsWorkflow(container).run(
      {
        input: {
          regions: [
            {
              name: "Eurozone",
              currency_code: "eur",
              countries: EUROPEAN_COUNTRIES,
              payment_providers: ["pp_system_default"],
            },
            {
              name: "United States",
              currency_code: "usd",
              countries: NORTH_AMERICA_COUNTRIES,
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      }
    );
    logger.info(`Created ${regionResult.length} regions.`);
  } else {
    logger.info("Regions already exist, skipping.");
  }

  // Re-fetch regions
  const allRegions = await regionService.listRegions();
  const europeRegion = allRegions.find((r) => r.currency_code === "eur");
  const usRegion = allRegions.find((r) => r.currency_code === "usd");

  // --- TAX REGIONS ---
  logger.info("Checking tax regions...");
  const { data: existingTaxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  });
  if (!existingTaxRegions.length) {
    logger.info("Creating tax regions...");
    await createTaxRegionsWorkflow(container).run({
      input: [...EUROPEAN_COUNTRIES, ...NORTH_AMERICA_COUNTRIES].map(
        (country_code) => ({
          country_code,
          provider_id: "tp_system",
        })
      ),
    });
  } else {
    logger.info("Tax regions already exist, skipping.");
  }

  // --- STOCK LOCATION ---
  const { data: existingLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  let stockLocation = existingLocations.find(
    (loc) => loc.name === "European Warehouse"
  );

  if (!stockLocation) {
    logger.info("Creating stock location...");
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "European Warehouse",
            address: {
              city: "france",
              country_code: "fr",
              address_1: "",
            },
          },
        ],
      },
    });
    stockLocation = result[0];

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  } else {
    logger.info("Stock location already exists, skipping.");
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_location_id: stockLocation.id },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  // --- FULFILLMENT / SHIPPING ---
  logger.info("Setting up shipping...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile =
    shippingProfiles.length > 0 ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: "Default Shipping Profile", type: "default" }],
      },
    });
    shippingProfile = result[0];
  }

  const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
    name: "European Warehouse delivery",
  });

  let fulfillmentSet = fulfillmentSets.length > 0 ? fulfillmentSets[0] : null;

  if (fulfillmentSet === null) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets(
      {
        name: "European Warehouse delivery",
        type: "shipping",
        service_zones: [
          {
            name: "Europe",
            geo_zones: [
              {
                country_code: "gb",
                type: "country",
              },
              {
                country_code: "de",
                type: "country",
              },
              {
                country_code: "dk",
                type: "country",
              },
              {
                country_code: "se",
                type: "country",
              },
              {
                country_code: "fr",
                type: "country",
              },
              {
                country_code: "es",
                type: "country",
              },
              {
                country_code: "it",
                type: "country",
              },
            ],
          },
        ],
      }
    );
  }

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  });

  const shippingOptions = await fulfillmentModuleService.listShippingOptions();

  if (shippingOptions.length === 0) {
    logger.info("Creating shipping options...");
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Ship in 2-3 days.",
            code: "standard",
          },
          prices: [
            {
              currency_code: "usd",
              amount: 10,
            },
            {
              currency_code: "eur",
              amount: 10,
            },
            {
              region_id: europeRegion!.id,
              amount: 10,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Ship in 24 hours.",
            code: "express",
          },
          prices: [
            {
              currency_code: "usd",
              amount: 10,
            },
            {
              currency_code: "eur",
              amount: 10,
            },
            {
              region_id: usRegion!.id,
              amount: 10,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
      ],
    });
  } else {
    logger.info("✅ Shipping options already exist, skipping.");
  }

  //-- API KEY ---
  const existingApiKeys = await apiKeyService.listApiKeys({
    title: "Drone hub Publishable Key",
  });
  let publishableApiKey = existingApiKeys[0];
  if (!publishableApiKey) {
    logger.info("Creating publishable API key...");
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Drone hub Publishable Key",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });
    publishableApiKey = result[0];
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: publishableApiKey.id, add: [defaultSalesChannel[0].id] },
    });
  } else {
    logger.info("✅ Publishable API key already exists, skipping.");
  }

  // --- CATEGORY ---
  const categories = await productModuleService.listProductCategories({
    name: "Drones",
  });
  let droneCategory = categories[0];
  if (!categories.length) {
    logger.info("Creating category Drones...");
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: [{ name: "Drones", is_active: true }] },
    });
    droneCategory = result[0];
  }

  // --- PRODUCTS ---
  const products = await productModuleService.listProducts();
  if (products.length === 0) {
    logger.info("Creating products...");
    const { result: productsResult } = await createProductsWorkflow(
      container
    ).run({
      input: {
        products: [
          {
            title: "Drone Pro X1",
            category_ids: [
              droneCategory.id,
            ],
            description:
              "Experience the next level of drone technology with the Drone Pro X1. Equipped with advanced features and superior performance.",
            handle: "drone-pro-x1",
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            options: [
              {
                title: "Default option",
                values: ["Default"],
              },
            ],
            variants: [
              {
                title: "Default Variant",
                sku: "DRONE-PRO-X1-DEFAULT",
                options: {
                  "Default option": "Default",
                },
                prices: [
                  {
                    currency_code: "eur",
                    amount: 300000,
                  },
                  {
                    currency_code: "usd",
                    amount: 320000,
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
          {
            title: "Drone Lite A2",
            category_ids: [
              droneCategory.id,
            ],
            description:
              "Reimagine the feeling of a classic drone. With our Drone Lite A2, everyday essentials no longer have to be ordinary.",
            handle: "drone-lite-a2",
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            options: [
              {
                title: "Default option",
                values: ["Default"],
              },
            ],
            variants: [
              {
                title: "Default Variant",
                sku: "DRONE-LITE-A2-DEFAULT",
                options: {
                  "Default option": "Default",
                },
                prices: [
                  {
                    currency_code: "eur",
                    amount: 150000,
                  },
                  {
                    currency_code: "usd",
                    amount: 160000,
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
          {
            title: "Drone Mini S",
            category_ids: [
              droneCategory.id,
            ],
            description:
              "Reimagine the feeling of classic drones. With our Drone Mini S, everyday essentials no longer have to be ordinary.",
            handle: "drone-mini-s",
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            options: [
              {
                title: "Default option",
                values: ["Default"],
              },
            ],
            variants: [
              {
                title: "Default Variant",
                sku: "DRONE-MINI-S-DEFAULT",
                options: {
                  "Default option": "Default",
                },
                prices: [
                  {
                    currency_code: "eur",
                    amount: 100000,
                  },
                  {
                    currency_code: "usd",
                    amount: 120000,
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
          {
            title: "Drone Camera Pro",
            category_ids: [
              droneCategory.id,
            ],
            description:
              "Reimagine the feeling of classic cameras. With our Drone Camera Pro, everyday essentials no longer have to be ordinary.",
            handle: "drone-camera-pro",
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            options: [
              {
                title: "Default option",
                values: ["Default"],
              },
            ],
            variants: [
              {
                title: "Default Variant",
                sku: "DRONE-CAMERA-PRO-DEFAULT",
                options: {
                  "Default option": "Default",
                },
                prices: [
                  {
                    currency_code: "eur",
                    amount: 200000,
                  },
                  {
                    currency_code: "usd",
                    amount: 220000,
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
        ],
      },
    });

    for (const prod of productsResult) {
      await createDroneFromProductWorkflow(container).run({
        input: {
          product: prod,
          additional_data: {
            marketing_method: "sale_and_rent",
            rental_per_day_prices: { eur: 5000, usd: 7500 },
            translations: {
              fr: {
                title: "Drone Pro X1",
                description: "Une description en français",
              },
              en: { title: "Drone Pro X1", description: "English description" },
            },
          },
        },
      });
    }
  } else {
    logger.info("✅ Products already exist, skipping.");
  }

  // --- INVENTORY ---
  logger.info("Setting inventory...");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  // Get all existing inventory levels for this location
  const existingLevels = await inventoryModuleService.listInventoryLevels({
    location_id: stockLocation.id,
  });

  const existingItemIds = new Set(
    existingLevels.map((level) => level.inventory_item_id)
  );

  const inventoryLevels: CreateInventoryLevelInput[] = inventoryItems
    .filter((item: any) => !existingItemIds.has(item.id))
    .map((item: any) => ({
      location_id: stockLocation.id,
      stocked_quantity: 100,
      inventory_item_id: item.id,
    }));

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    });
  }
  
  logger.info("🎉 Demo data seeded successfully (safe re-run).");
}
