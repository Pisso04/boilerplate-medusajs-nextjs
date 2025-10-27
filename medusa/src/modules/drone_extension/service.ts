import { MedusaService } from "@medusajs/framework/utils";
import { Drone } from "./models/drone";

class DroneExtensionModuleService extends MedusaService({
  Drone,
}) {}

export default DroneExtensionModuleService;
