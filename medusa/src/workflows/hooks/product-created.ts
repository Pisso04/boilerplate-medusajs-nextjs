import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import {
  createDroneFromProductWorkflow,
  CreateDroneFromProductWorkflowInput,
} from "../create_drone_from_product";

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    if (!additional_data) {
      return;
    }
    const workflow = createDroneFromProductWorkflow(container);

    for (const product of products) {
      await workflow.run({
        input: {
          product,
          additional_data,
        } as CreateDroneFromProductWorkflowInput,
      });
    }
  }
);
