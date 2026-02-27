import { Router } from "express";
import { identifyContact } from "../services/contactService";

const router = Router();

router.post("/identify", async (req, res) => {
    try {
        let { email, phoneNumber } = req.body;

        if (!email && !phoneNumber) {
            return res.status(400).json({ error: "Either email or phoneNumber must be provided" });
        }

        // Convert numeric phoneNumber to string if provided
        if (phoneNumber !== undefined && phoneNumber !== null) {
            phoneNumber = String(phoneNumber);
        }

        if (email !== undefined && email !== null) {
            email = String(email);
        }

        const result = await identifyContact(email || null, phoneNumber || null);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in /identify:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
