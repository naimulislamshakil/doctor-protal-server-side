const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

// verify jwt token

function verifyToken(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ massage: "Unauthorization access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      res.status(403).send({ massage: "Forbidden access" });
    }
    req.decoded = decoded;
    console.log(req.decoded);
    next();
  });
}

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

    // apponment Callection
    const apponmentCallection = client
      .db("doctorPortal")
      .collection("apponment");

    // user collection
    const userCallection = client.db("doctorPortal").collection("user");

    // user store api

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const quary = { email: email };
      const option = { upsert: true };
      const update = {
        $set: user,
      };
      const result = await userCallection.updateOne(quary, update, option);
      const token = jwt.sign(quary, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });

      res.send({ result, token });
    });

    // make user admin api
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCallection.findOne(requester);
      if (requesterAccount.role === "admin") {
        const quary = { email: email };
        const update = {
          $set: { role: "admin" },
        };
        const result = await userCallection.updateOne(quary, update);

        res.send(result);
      } else {
        res.status(403).send("Forbidden access");
      }
    });

    // get all user
    app.get("/user", verifyToken, async (req, res) => {
      const user = await userCallection.find().toArray();
      res.send(user);
    });

    // delete user
    app.delete("/user/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const quary = { _id: ObjectId(id) };
      const result = await userCallection.deleteOne(quary);
      res.send(result);
    });

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
    app.get("/booking", verifyToken, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email === decodedEmail) {
        const quary = { email: email };
        const bookingApponment = await apponmentCallection
          .find(quary)
          .toArray();
        return res.send(bookingApponment);
      } else {
        return req.status(403).send({ massage: "Forbidden access" });
      }
    });

    app.post("/booking", async (req, res) => {
      const apponmentDetils = req.body;
      const quary = {
        treatmentName: apponmentDetils.treatmentName,
        date: apponmentDetils.date,
        email: apponmentDetils.email,
      };
      const exists = await apponmentCallection.findOne(quary);

      if (exists) {
        return res.send({ success: false, booking: exists });
      } else {
        const result = await apponmentCallection.insertOne(apponmentDetils);
        res.send({ success: true, result });
      }
    });

    // Get all treatementCollaction time and exclude given booking apponment

    app.get("/available", async (req, res) => {
      const date = req.query.date;

      // step 1: get all treatment collaction

      const treatment = await treatmentCollaction.find().toArray();
      // step 2: get the booking of that day
      const quary = { date: date };
      const bookingApponment = await apponmentCallection.find(quary).toArray();
      // step 3: for eatch treatment ,find bookingApponment for that treatment
      treatment.forEach((service) => {
        const serviceBookings = bookingApponment.filter(
          (b) => b.treatmentName === service.name
        );
        // console.log(serviceBookings);
        const booked = serviceBookings.map((s) => s.hour);
        const available = service.time.filter((book) => !booked.includes(book));
        service.time = available;
      });

      res.send(treatment);
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
