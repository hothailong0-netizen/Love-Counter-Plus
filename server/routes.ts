import type { Express } from "express";
import { createServer, type Server } from "node:http";
import {
  getFirstCouple,
  createCouple,
  updateCouple,
  getMemories,
  createMemory,
  deleteMemory,
  getImportantDates,
  createImportantDate,
  deleteImportantDate,
} from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/couple", async (_req, res) => {
    try {
      const couple = await getFirstCouple();
      res.json(couple || null);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/couple", async (req, res) => {
    try {
      const couple = await createCouple(req.body);
      res.status(201).json(couple);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/couple/:id", async (req, res) => {
    try {
      const couple = await updateCouple(req.params.id, req.body);
      res.json(couple);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/memories/:coupleId", async (req, res) => {
    try {
      const mems = await getMemories(req.params.coupleId);
      res.json(mems);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/memories", async (req, res) => {
    try {
      const memory = await createMemory(req.body);
      res.status(201).json(memory);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/memories/:id", async (req, res) => {
    try {
      await deleteMemory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/important-dates/:coupleId", async (req, res) => {
    try {
      const dates = await getImportantDates(req.params.coupleId);
      res.json(dates);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/important-dates", async (req, res) => {
    try {
      const date = await createImportantDate(req.body);
      res.status(201).json(date);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/important-dates/:id", async (req, res) => {
    try {
      await deleteImportantDate(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
