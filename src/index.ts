import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
    res.json({
        message: "Bitespeed Identity Reconciliation Service",
        status: "running",
    });
});

// TODO: Mount /identify route in Phase 3

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
