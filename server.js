const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const dotenv = require('dotenv');

dotenv.config({ path: './.env.development' });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// const productSchema = require('./models/Products');
const userSchema = require('./models/Users');
const employeeSchema = require('./models/Employees');

const uriMap = {
  ProductsDB: process.env.MONGO_DEV_CLIENT_URI,
  UsersEmployeesDB: process.env.MONGO_DEV_SERVER_URI,
};

const connections = {};
const models = {};

//
const getConnection = async dbName => {

  console.log("getConnection called with dbName:", dbName);

  if (!uriMap[dbName]) {
    throw new Error(`No URI mapped for database: ${dbName}`);
  }

  if (!connections[dbName]) {
    const DB_URI = uriMap[dbName];
    console.log(`Creating new connection for ${dbName}`);
    connections[dbName] = await mongoose.createConnection(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`New connection created for ${dbName}`);
  } else {
    console.log(`Using existing connection for ${dbName}`);
  }

  return connections[dbName];
}


// Function to get or create a model based on the database and collection name
const getModel = async (dbName, collectionName) => {
  console.log("getModel called with:", { dbName, collectionName });

  const modelKey = `${dbName}-${collectionName}`;
  console.log("Generated modelKey:", modelKey);

  if (!models[modelKey]) {
    console.log("Model not found in cache, creating new model");
    const connection = await getConnection(dbName);

    // Assign the appropriate schema based on the collection name
    let schema;
    switch (collectionName) {
      case "Products":
        schema = productSchema;
        break;
      // case "Users":
      //   schema = userSchema;
      //   break;
      // case "Employees":
      //   schema = employeeSchema;
      //   break;
      default:
        throw new Error(`No schema defined for collection: ${collectionName}`);
    }

    models[modelKey] = connection.model(collectionName, schema, collectionName);
    console.log(`Created new model for collection: ${collectionName}`);
  } else {
    console.log(`Reusing cached model for: ${modelKey}`);
  }

  return models[modelKey];
};


// Routes








// GET route to find documents
app.get("/find/:database/:collection", async (req, res) => {
  try {
    const { database, collection } = req.params;
    console.log("GET request received for:", { database, collection });

    const Model = await getModel(database, collection);
    console.log("Model retrieved, executing find query");

    const documents = await Model.find({}).lean();
    console.log("Query executed, document count:", documents.length);

    res.status(200).json(documents);
  } catch (err) {
    console.error("Error in GET route:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST route to insert documents
app.post("/insert/:database/:collection", async (req, res) => {
  try {
    const { database, collection } = req.params;
    const Model = await getModel(database, collection);

    // Check if single or multiple documents
    if (req.body.document) {
      // Single document insert
      const newDocument = await Model.create(req.body.document);
      res.status(201).json({
        message: "Document inserted successfully",
        insertedId: newDocument._id,
      });
    } else if (req.body.documents && Array.isArray(req.body.documents)) {
      // Multiple documents insert
      const newDocuments = await Model.insertMany(req.body.documents);
      res.status(201).json({
        message: `${newDocuments.length} documents inserted`,
        insertedIds: newDocuments.map(doc => doc._id),
      });
    } else {
      res.status(400).json({
        error:
          "Request body must contain either 'document' or 'documents' as array",
      });
    }
  } catch (err) {
    console.error("Error in POST route:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE route to remove a document by ID
app.delete("/delete/:database/:collection/:id", async (req, res) => {
  try {
    const { database, collection, id } = req.params;

    const Model = await getModel(database, collection);
    const result = await Model.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send(`Document with ID ${id} not found.`);
    }
    res.status(200).send(`Document with ID ${id} deleted successfully.`);
  } catch (err) {
    console.error("Error in DELETE route:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT route to update a document by ID
app.put("/update/:database/:collection/:id", async (req, res) => {
  try {
    const { database, collection, id } = req.params;
    const updateData = req.body.update;

    if (!updateData) {
      return res.status(400).json({ error: "Update data not provided" });
    }

    const Model = await getModel(database, collection);
    const result = await Model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({
      message: "Document updated successfully",
      modifiedDocument: result,
    });
  } catch (err) {
    console.error("Error in PUT route:", err);
    res.status(500).json({ error: err.message });
  }
});


















//find users endpoint
app.get("/all-users/:database/:collection", async (req, res) => {
  try {
    const { database, collection } = req.params;
    const db = client.db(database);
    const documents = await db.collection(collection).find({}).toArray();
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/add-user/:database/:collection", async (req, res) => {
  try {
    const { document } = req.body;
    const { database, collection } = req.params;
    const db = client.db(database);
    const allDocuments = await db.collection(collection).find({}).toArray();
    // allDocuments.forEach(())
    const result = await db.collection(collection).insertOne(document);
    res.status(201).send(`Document inserted with ID: ${result.insertedId}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete("/delete-user/:database/:collection/:id", async (req, res) => {
  try {
    const { database, collection, id } = req.params;
    const db = client.db(database);
    const result = await db
      .collection(collection)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).send(`Document with ID ${id} deleted successfully.`);
    } else {
      res.status(404).send(`Document with ID ${id} not found.`);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Employees
app.get('/company-home/employees', (req, res) => {
  try {
    const employees = require("./db/employees.json");
    res.json(employees);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
})
// Login
app.get('/company-home/login', (req, res) => {
  try {

  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
})
// Users
app.get('/company-home/users', (req, res) => {
  try {

  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
})


app.get("/find/:database/:employees", async (req, res) => {

});

app.get("/find/:database/:users", async (req, res) => {

});
////
app.post("/user/create-user", async (req, res) => {

})
app.put("/user/update-user/:id/:email/:password", async (req, res) => {
  const { email, password } = req.params;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.password = password;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(`Error updating user: ${error.message}`)
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete("/user/delete-user/:email(or id)/", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
////
app.post("/employee/create-employee/:email(or id)", async (req, res) => {

});
app.put("/employee/update-employee/:id/:email/:password", async (req, res) => {
  const { email, password } = req.params;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    employee.password = password;
    const updatedEmployee = await employee.save();
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(`Error updating employee: ${error.message}`)
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete("/employee/delete-employee/:email(or id)/", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Test connections before starting server
async function startServer() {
  try {
    console.log("Starting server with environment variables:", {
      MONGO_CLIENT_URI: process.env.MONGO_CLIENT_URI ? "Present" : "Missing",
      MONGO_SERVER_URI: process.env.MONGO_SERVER_URI ? "Present" : "Missing",
      PORT: process.env.PORT || 3000,
    });
    console.log("Raw URIs:", {
      client: process.env.MONGO_CLIENT_URI,
      server: process.env.MONGO_SERVER_URI,
    });

    // Only test ProductsDB for now since we only have Products schema
    const testDatabases = ["ProductsDB"];
    for (const dbName of testDatabases) {
      const connection = await getConnection(dbName);
      console.log(`Successfully connected to MongoDB database: ${dbName}`);

      // Only test Products collection
      const testCollections = ["Products"];
      for (const collectionName of testCollections) {
        const Model = await getModel(dbName, collectionName);
        const count = await Model.estimatedDocumentCount();
        console.log(
          `Found approximately ${count} documents in ${collectionName} collection of ${dbName}`
        );
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}
startServer();