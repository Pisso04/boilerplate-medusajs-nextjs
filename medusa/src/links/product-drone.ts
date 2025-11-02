import { defineLink } from "@medusajs/framework/utils";
import DroneExtensionModule from "../modules/drone_extension";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(
  ProductModule.linkable.product,
  DroneExtensionModule.linkable.drone
);
