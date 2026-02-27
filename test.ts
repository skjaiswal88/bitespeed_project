import fetch from "node-fetch";
import { execSync } from "child_process";

// Simple test script to run against the dev server
async function runTests() {
    console.log("Cleaning database...");
    execSync("npx prisma migrate reset --force", { stdio: "inherit" });

    console.log("\n--- Running Tests ---\n");

    const identify = async (payload: any) => {
        const res = await fetch("http://localhost:3000/identify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(`Request:`, payload);
        console.log(`Response:`, JSON.stringify(data, null, 2));
        console.log("------------------------");
        return data;
    };

    // Scenario 1: New customer
    await identify({ email: "lorraine@hillvalley.edu", phoneNumber: "123456" });

    // Scenario 2: Existing customer with new email (creates secondary)
    await identify({ email: "mcfly@hillvalley.edu", phoneNumber: "123456" });

    // Scenario 3: Another new customer
    await identify({ email: "biff@tannen.com", phoneNumber: "999999" });

    // Scenario 4: Linking the two distinct customers together (primary -> secondary conversion)
    await identify({ email: "mcfly@hillvalley.edu", phoneNumber: "999999" });

}

runTests().catch(console.error);
