import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import DroneExtensionModuleService from "../../../modules/drone_extension/service";
import { DRONE_EXTENSION_MODULE } from "../../../modules/drone_extension";

type CreateDroneStepInput = {
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

export const createDroneStep = createStep(
  "create-drone",
  async (data: CreateDroneStepInput, { container }) => {
    const droneExtensionModuleService: DroneExtensionModuleService =
      container.resolve(DRONE_EXTENSION_MODULE);

    const drone = await droneExtensionModuleService.createDrones(data);

    return new StepResponse(drone, drone);
  },
  async (drone, { container }) => {
    const droneExtensionModuleService: DroneExtensionModuleService =
      container.resolve(DRONE_EXTENSION_MODULE);

    await droneExtensionModuleService.deleteDrones(drone!.id);
  }
);
