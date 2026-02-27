import express from "express";
import config from "./config";
import prisma from "./config/database";
import identifyRoute from "./routes/identify";

const app = express();

// Middleware
app.use(express.json());

// Identify route
app.use("/", identifyRoute);

// Health check
app.get("/", async (_req, res) => {
    try {
        // Verify database connection
        await prisma.$connect();
        res.json({
            message: "Bitespeed Identity Reconciliation Service",
            status: "running",
            database: "connected",
        });
    } catch (error) {
        res.status(500).json({
            message: "Bitespeed Identity Reconciliation Service",
            status: "running",
            database: "disconnected",
        });
    }
});

// TODO: Mount /identify route in Phase 3

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
