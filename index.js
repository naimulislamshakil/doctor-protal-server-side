const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// madelware
app.use(cors());
app.use(express.json());

// Mongodb client connect

const uri = `mongodb+srv://${process.env.ACCESS_USERNAME}:${process.env.ACCESS_PASSWORD}@cluster0.pninc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
console.log("db connect");

async function run() {
  try {
    await client.connect();

    const tastmonialCollaction = client
      .db("doctorPortal")
      .collection("treatment");

    app.get("/treatment", async (req, res) => {
      const quary = {};
      const corsur = tastmonialCollaction.find(quary);
      const result = await corsur.toArray();
      res.send(result);
    });
  } finally {
    await client.close();
  }
}

// colling function

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
