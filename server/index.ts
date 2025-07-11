import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getCities,
  getWarehouses,
  getLockers,
  calculateTariff,
  getRegions,
  getRegionCities,
} from "./routes/tariffs";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Tariff calculator routes
  app.get("/api/cities", getCities);
  app.get("/api/warehouses", getWarehouses);
  app.get("/api/lockers", getLockers);
  app.post("/api/calculate-tariff", calculateTariff);

  // Region-based city selection routes
  app.get("/api/regions", getRegions);
  app.get("/api/regions/:regionId/cities", getRegionCities);

  return app;
}
