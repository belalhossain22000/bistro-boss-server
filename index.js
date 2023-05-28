// Import required modules
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Create an instance of Express
const app = express();

// Enable CORS middleware
app.use(cors());
app.use(express.json());

//mongo db connection

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dp3om9f.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const menuCollection = client.db("bistroDb").collection("menu");
    const cartsCollection = client.db("bistroDb").collection("carts");

    app.get("/menu", async (req, res) => {
      try {
        // Retrieve all menu items
        const menuItems = await menuCollection.find().toArray();

        // Send the menu items as the response
        res.send(menuItems);
      } catch (err) {
        console.error("Error retrieving menu items: ", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //get api for get by user email

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });

    //post api for add to cart
    app.post("/carts", async (req, res) => {
      const item = req.body;
      const result = await cartsCollection.insertOne(item);
      res.send(result);
    });

    //delete cart item by id

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result=await cartsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Define a route for the homepage
app.get("/", (req, res) => {
  res.send("bistro boss is running on server 5000 port");
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
