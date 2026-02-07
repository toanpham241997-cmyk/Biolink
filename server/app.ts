import express from "express";
import { purchase } from "./routes/purchase";

const app = express();
app.use(express.json());

app.post("/api/purchase", purchase);

export default app;
