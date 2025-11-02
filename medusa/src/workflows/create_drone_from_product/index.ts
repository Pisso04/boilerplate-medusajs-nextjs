import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ProductDTO } from "@medusajs/framework/types";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { DRONE_EXTENSION_MODULE } from "../../modules/drone_extension";
import { createDroneStep } from "./steps/create-drone";

export type CreateDroneFromProductWorkflowInput = {
  product: ProductDTO;
  additional_data?: {
    marketing_method?: "sale" | "rent" | "sale_and_rent";
    rental_per_day_prices?: Record<string, number>;
    translations?: Record<
      string,
      {
        title: string;
        description: string;
      }
    >;
  };
};

export const createDroneFromProductWorkflow = createWorkflow(
  "create-drone-from-product",
  (input: CreateDroneFromProductWorkflowInput) => {
    const productCustomData = transform(
      {
        input,
      },
      (data) => data.input.additional_data
    );

    const drone = createDroneStep({
      marketing_method: productCustomData?.marketing_method || "sale",
      rental_per_day_prices: productCustomData?.rental_per_day_prices,
      translations: productCustomData?.translations,
    });

    when({ drone }, ({ drone }) => drone !== undefined).then(() => {
      createRemoteLinkStep([
        {
          [Modules.PRODUCT]: {
            product_id: input.product.id,
          },
          [DRONE_EXTENSION_MODULE]: {
            drone_id: drone.id,
          },
        },
      ]);
    });

    return new WorkflowResponse({
      drone,
    });
  }
);
