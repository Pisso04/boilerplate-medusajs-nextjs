import DroneExtensionModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const DRONE_EXTENSION_MODULE = "drone_extension";

export default Module(DRONE_EXTENSION_MODULE, {
  service: DroneExtensionModuleService,
});
