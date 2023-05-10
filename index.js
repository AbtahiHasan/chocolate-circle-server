require("dotenv").config()
const express = require("express")
const cors = require("cors")
const port = process.env.PORT || 3000
const app = express()

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.oasvurr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!")

    const database = client.db("chocolate-circle")
    const chocolatesCollection = database.collection("chocolates")

    app.get("/", async(req, res) => {
        const chocolates = chocolatesCollection.find()
        const result = await chocolates.toArray()
        res.send(result)
    })
    app.get("/:id", async(req, res) => {
        const id = req.params.id 
        const chocolate = await chocolatesCollection.findOne({_id: new ObjectId(id)})
        res.send(chocolate)
    })

    app.post("/", async (req, res) => {
        const chocolate = req.body
        const result = await chocolatesCollection.insertOne(chocolate)
        res.send(result)
    })

    app.put("/:id", async (req, res) => {
        const id = req.params.id
        const chocolate = req.body
        const result = await chocolatesCollection.updateOne({_id: new ObjectId(id)}, {
            $set: {
                name: chocolate.name,
                country: chocolate.country,
                category: chocolate.category
            }},
            {
                upsert: true
            }
        )
        res.send(result)
    })

    app.delete("/:id", (req, res) => {
        const id = req.params.id
        const result = chocolatesCollection.deleteOne({_id: new ObjectId(id)})
        res.send(result)
    })

  } catch(error) {
    console.log(error)
  }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`this server running at ${port}`)
})