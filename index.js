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

async function run() {
  try {
    await client.connect();

    // treatment collection

    const treatmentCollaction = client
      .db("doctorPortal")
      .collection("treatment");

    //   tastmonial collection
    const tastmonialCallection = client
      .db("doctorPortal")
      .collection("tastmonial");

    const apponmentCallection = client
      .db("doctorPortal")
      .collection("apponment");

    // treatment api section

    app.get("/treatment", async (req, res) => {
      const quary = {};
      const corser = treatmentCollaction.find(quary);
      const result = await corser.toArray();
      res.send(result);
    });

    //   tastmonial api section

    app.get("/tastmonial", async (req, res) => {
      const quary = {};
      const corser = tastmonialCallection.find(quary);
      const result = await corser.toArray();
      res.send(result);
    });

    // apponment api section
    app.post("/booking", async (req, res) => {
      const apponmentDetils = req.body;
      const quary = {
        treatment: apponmentDetils.treatmentName,
        date: apponmentDetils.timeHour,
        personName: apponmentDetils.personName,
      };
      const exists = await apponmentCallection.findOne(quary);
      if (exists) {
        return res.send({ success: false, booking: exists });
      } else {
        const result = await apponmentCallection.insertOne(apponmentDetils);
        res.send({ success: true, booking: result });
      }
    });
  } finally {
    // await client.close()
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
