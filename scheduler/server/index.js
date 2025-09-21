import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.json({
    message: "Hello world",
  });
});
cron.schedule("* * * * *", () => {
  console.log("scheduled h");
});
app.listen(process.env.PORT, () => {
  console.log(`process is running at the ${process.env.PORT} port`);
});
