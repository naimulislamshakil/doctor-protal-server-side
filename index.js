const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// madelware
app.use(cors());
app.use(express.json());

// xQHBcXkJZgrXz2qX
// doctor_por_tal

// app.get("/tastmonial", (req, res) => {
//     const quary = {};
//     // const corsur = tastmonialCollaction.find(quary);
//     const result = await corsur.toArray();
//     res.send(result);
// })

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
