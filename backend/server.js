require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const bodyParser = require("body-parser"); // Not needed if using express.json()
const UserfetchModel = require("./models/Users");
const Task = require("./models/Task"); // Create a Task model
const Notification = require("./models/Notification");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid"); // ✅ Correct import
const multer = require("multer");
const path = require("path");




const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000" }));
// (Note: express.json() is built-in so you don't need bodyParser.json())


// Use environment variable for MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Atlas connected successfully"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));


// mongoose
//   .connect("mongodb+srv://finaxis-user-31:RK8%28ha7Haa7%23jU%25@cluster0.ykhfs.mongodb.net/test?retryWrites=true&w=majority", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB Atlas connected"))
//   .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));




  // Connect to MongoDB
// mongoose
//   .connect("mongodb://127.0.0.1:27017/test", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("Error connecting to MongoDB:", err));

/* ============================
   User Schema & Endpoints
   ============================ */

// Define Schema
const formSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  AccountInformation: Object,
  MeansOfFinance: Object,
  CostOfProject: Object,
  ProjectReportSetting: Object,
  Expenses: Object,
  Revenue: Object,
  MoreDetails: Object,
});
const FormData = mongoose.model("FormData", formSchema);


// Configure Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files to the 'uploads/' directory
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); // Unique filename
  },
});

// File Filter (Optional - to allow only specific file types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .png, and .pdf files are allowed"), false);
  }
};

// Set up Multer middleware
const upload = multer({ storage, fileFilter });



app.post("/save-step", upload.single("file"), async (req, res) => {
  try {
      console.log("🔹 Incoming Request to /save-step:", req.body);

      const { sessionId, step, data } = req.body;
      let updateData;

      try {
          updateData = data ? JSON.parse(data) : {};
      } catch (jsonError) {
          console.error("🔥 JSON Parsing Error:", jsonError);
          return res.status(400).json({ message: "Invalid JSON data", error: jsonError.message });
      }

      console.log("📌 Parsed Data Before File Processing:", updateData);

      if (!updateData.AccountInformation) {
          updateData.AccountInformation = {};
      }

      if (req.file) {
          console.log("📂 File Uploaded:", req.file);
          updateData.AccountInformation.logoOfBusiness = `/uploads/${req.file.filename}`;
      }

      if (!sessionId || sessionId === "undefined") {
          // 🛑 Step 1 - Check if document already exists before creating a new one
          console.log("🛑 Checking if a report already exists...");

          const existingForm = await FormData.findOne({ step: 1, ...updateData });

          if (existingForm) {
              console.log("⚠️ Report already exists, using existing sessionId:", existingForm.sessionId);
              return res.status(200).json({
                  message: "Report already exists, updating sessionId",
                  sessionId: existingForm.sessionId,
                  filePath: updateData.AccountInformation.logoOfBusiness || null,
              });
          }

          console.log("🆕 Creating New Report...");
          const newSessionId = uuidv4();
          const newForm = new FormData({ sessionId: newSessionId, ...updateData });

          await newForm.save();

          return res.status(201).json({
              message: "New report created successfully",
              sessionId: newSessionId,
              filePath: updateData.AccountInformation.logoOfBusiness || null,
          });
      }

      console.log("🔄 Updating Existing Report for sessionId:", sessionId);

      const updatedForm = await FormData.findOneAndUpdate(
          { sessionId },
          { $set: updateData },
          { new: true, upsert: false }
      );

      if (!updatedForm) {
          console.error("❌ Session ID not found:", sessionId);
          return res.status(404).json({ message: "Session ID not found" });
      }

      console.log("✅ Data Updated Successfully:", updatedForm);
      return res.status(200).json({ message: "Data updated successfully", filePath: updateData.AccountInformation.logoOfBusiness || null });

  } catch (error) {
      console.error("🔥 Error in /save-step API:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

app.post("/create-new-from-existing", upload.single("file"), async (req, res) => {
  try {
      console.log("🔹 Incoming Request to /create-new-from-existing:", req.body);

      if (!req.body.data) {
          return res.status(400).json({ message: "Missing data in request body" });
      }

      let newData;
      try {
          newData = JSON.parse(req.body.data);
      } catch (jsonError) {
          console.error("🔥 JSON Parsing Error:", jsonError);
          return res.status(400).json({ message: "Invalid JSON format", error: jsonError.message });
      }

      console.log("📌 Parsed Data Before File Processing:", newData);

      // ✅ Ensure `AccountInformation` exists
      if (!newData.AccountInformation) {
          newData.AccountInformation = {};
      }

      // ✅ Handle file upload
      if (req.file) {
          console.log("📂 File Uploaded:", req.file);
          newData.AccountInformation.logoOfBusiness = `/uploads/${req.file.filename}`;
      }

      let sessionToUse = newData.sessionId;

      if (sessionToUse) {
          // ✅ If sessionId exists, update the existing document
          console.log("🔄 Updating existing document for sessionId:", sessionToUse);

          const updatedForm = await FormData.findOneAndUpdate(
              { sessionId: sessionToUse },
              { $set: newData },
              { new: true, upsert: false }
          );

          if (!updatedForm) {
              return res.status(404).json({ message: "Session ID not found" });
          }

          return res.status(200).json({
              message: "Data updated successfully",
              sessionId: sessionToUse,
              filePath: newData.AccountInformation.logoOfBusiness || null,
          });
      }

      // ✅ If no sessionId, create a new document (only for Step 1)
      const newSessionId = uuidv4();
      console.log("🆕 Creating a New Report with sessionId:", newSessionId);

      const newForm = new FormData({ sessionId: newSessionId, ...newData });

      await newForm.save();
      console.log("✅ New Document Saved Successfully:", newSessionId);

      return res.status(201).json({
          message: "New report created successfully",
          sessionId: newSessionId, // ✅ Return sessionId so frontend can store it
          filePath: newData.AccountInformation.logoOfBusiness || null,
      });

  } catch (error) {
      console.error("🔥 Error in /create-new-from-existing API:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// app.post("/start-new-session", upload.single("file"), async (req, res) => {
//   try {
//     console.log("🔹 Incoming Request to /start-new-session:", req.body);

//     const { step, data } = req.body;
//     let updateData;

//     // ✅ Step 1: Parse JSON data safely
//     try {
//       updateData = data ? JSON.parse(data) : {};
//     } catch (jsonError) {
//       console.error("🔥 JSON Parsing Error:", jsonError);
//       return res.status(400).json({ message: "Invalid JSON data", error: jsonError.message });
//     }

//     console.log("📌 Parsed Data Before File Processing:", updateData);

//     // ✅ Step 2: Ensure AccountInformation exists
//     if (!updateData.AccountInformation) {
//       updateData.AccountInformation = {};
//     }

//     // ✅ Step 3: Handle File Upload
//     if (req.file) {
//       console.log("📂 File Uploaded:", req.file);
//       updateData.AccountInformation.logoOfBusiness = `/uploads/${req.file.filename}`;
//     }

//     // ✅ Step 4: Validate Step Field
//     if (!step) {
//       return res.status(400).json({ message: "Step is required" });
//     }

//     // ✅ Step 5: Generate a new session ID only if it's the initial step
//     const newSessionId = uuidv4();
//     console.log("🆕 New Session ID:", newSessionId);

//     // ✅ Insert document into MongoDB
//     await FormData.create({ sessionId: newSessionId, ...updateData });

//     console.log("✅ New session created successfully:", newSessionId);

//     return res.status(201).json({
//       message: "New session started successfully",
//       sessionId: newSessionId,
//       filePath: updateData.AccountInformation.logoOfBusiness || null,
//     });

//   } catch (error) {
//     console.error("🔥 Error in /start-new-session API:", error);
//     return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// });


app.get("/fetch-business-data", async (req, res) => {
  let { businessName, clientName, isCreateReportWithExistingClicked } = req.query;

  if (!businessName?.trim() && !clientName?.trim()) {
    return res.status(400).json({ message: "Either businessName or clientName is required" });
  }

  try {
    let query = {};

    if (businessName?.trim()) {
      query["AccountInformation.businessName"] = { $regex: businessName.trim(), $options: "i" }; // ✅ Partial match
    }

    if (clientName?.trim()) {
      query["AccountInformation.clientName"] = { $regex: clientName.trim(), $options: "i" }; // ✅ Partial match
    }

    console.log("🔍 Query Conditions:", query);

    let selectFields = "-__v"; // ✅ Exclude unnecessary fields
    if (isCreateReportWithExistingClicked === "true") {
      selectFields += " -sessionId"; // ✅ Exclude sessionId when creating new with existing
    }

    console.log("📌 Selected Fields:", selectFields);

    // ✅ Optimize with `.lean()` and dynamically select fields
    const businessData = await FormData.find(query).select(selectFields).lean();

    console.log("✅ Query Result:", businessData);

    if (!businessData.length) {
      return res.status(404).json({ message: "No records found for the given criteria" });
    }

    return res.status(200).json({ message: "Business data fetched successfully", data: businessData });
  } catch (error) {
    console.error("❌ Error fetching business data:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

app.post("/update-step", async (req, res) => {
  const { sessionId, data } = req.body;

  try {
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required for updating." });
    }

    // Find and update the existing document
    const updatedForm = await FormData.findOneAndUpdate(
      { sessionId },
      { $set: data },
      { new: true } // Return the updated document
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Session ID not found. Cannot update." });
    }

    return res.status(200).json({ message: "Data updated successfully." });
  } catch (error) {
    console.error("Error updating form data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//new api with image upload

// app.post("/save-step", upload.single("file"), async (req, res) => {
//   try {
//     console.log("🔹 Incoming Request to /save-step:", req.body);

//     const { sessionId, step, data } = req.body;
//     let updateData;

//     try {
//       updateData = data ? JSON.parse(data) : {};
//     } catch (jsonError) {
//       console.error("🔥 JSON Parsing Error:", jsonError);
//       return res.status(400).json({ message: "Invalid JSON data", error: jsonError.message });
//     }

//     console.log("📌 Parsed Data:", updateData);

//     if (req.file) {
//       console.log("📂 File Uploaded:", req.file);
//       const filePath = `/uploads/${req.file.filename}`;
      
//       if (!updateData.AccountInformation) updateData.AccountInformation = {};
//       updateData.AccountInformation.logoOfBusiness = filePath;
//     }

//     if (!sessionId) {
//       console.log("🆕 Creating New Report...");
//       const newSessionId = uuidv4();
//       const newForm = new FormData({ sessionId: newSessionId, ...updateData });

//       await newForm.save();

//       return res.status(201).json({
//         message: "New report created successfully",
//         sessionId: newSessionId,
//         filePath: updateData?.AccountInformation?.logoOfBusiness || null,
//       });
//     }

//     console.log("🔄 Updating Existing Report for sessionId:", sessionId);

//     const updatedForm = await FormData.findOneAndUpdate(
//       { sessionId },
//       { $set: updateData },
//       { new: true, upsert: false }
//     );

//     if (!updatedForm) {
//       console.error("❌ Session ID not found:", sessionId);
//       return res.status(404).json({ message: "Session ID not found" });
//     }

//     console.log("✅ Data Updated Successfully:", updatedForm);
//     return res.status(200).json({ message: "Data updated successfully", filePath: updateData?.AccountInformation?.logoOfBusiness || null });

//   } catch (error) {
//     console.error("🔥 Error in /save-step API:", error);
//     return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// });





// app.post("/save-step", async (req, res) => {
//   const { sessionId, step, data } = req.body;

//   try {
//     console.log("Incoming Request to /save-step:", { sessionId, step, data });

//     if (!sessionId) {
//       // ✅ Remove `sessionId` if it exists in data
//       if (data._id) {
//         delete data._id;
//       }
//       if (data.sessionId) {
//         delete data.sessionId;
//       }

//       // ✅ Create a New Document
//       const newSessionId = uuidv4();
//       const newForm = new FormData({ sessionId: newSessionId, ...data });

//       await newForm.save(); // ✅ Ensure this operation completes

//       console.log("✅ New document successfully created with sessionId:", newSessionId);
      
//       return res.status(201).json({
//         message: "New report created successfully",
//         sessionId: newSessionId,
//       });
//     }

//     // ✅ Update Existing Document
//     const updatedForm = await FormData.findOneAndUpdate(
//       { sessionId },
//       { $set: data },
//       { new: true, upsert: false }
//     );

//     if (!updatedForm) {
//       console.error("❌ Session ID not found:", sessionId);
//       return res.status(404).json({ message: "Session ID not found" });
//     }

//     console.log("✅ Existing document successfully updated:", updatedForm);
    
//     return res.status(200).json({ message: "Data updated successfully" });

//   } catch (error) {
//     console.error("🔥 Error in /save-step API:", error);
//     return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// });





// app.get("/fetch-business-data", async (req, res) => {
//   let { businessName, clientName } = req.query;

//   if (!businessName && !clientName) {
//     return res.status(400).json({ message: "Either businessName or clientName is required" });
//   }

//   try {
//     // ✅ Construct dynamic query based on available parameters
//     let query = {};
    
//     if (businessName) {
//       query["AccountInformation.businessName"] = { $regex: `^${businessName}$`, $options: "i" };
//     }

//     if (clientName) {
//       query["AccountInformation.clientName"] = { $regex: `^${clientName}$`, $options: "i" };
//     }

//     // ✅ Fetch data based on query
//     const businessData = await FormData.find(query);

//     console.log("Query Result:", businessData);

//     if (!businessData.length) {
//       return res.status(404).json({ message: "No records found for the given criteria" });
//     }

//     return res.status(200).json({ message: "Business data fetched successfully", data: businessData });
//   } catch (error) {
//     console.error("Error fetching business data:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });


// ✅ Update existing document (does NOT create new)






// app.post("/save-step", async (req, res) => {
//   const { sessionId, step, data } = req.body;

//   try {
//     if (!sessionId) {
//       // Create New Document (Step 1)
//       const newSessionId = uuidv4(); // Generate a unique session ID
//       const newForm = new FormData({ sessionId: newSessionId, ...data });
//       await newForm.save();
//       return res
//         .status(201)
//         .json({ message: "Data saved", sessionId: newSessionId });
//     } else {
//       // Update Existing Document
//       const updatedForm = await FormData.findOneAndUpdate(
//         { sessionId },
//         { $set: data },
//         { new: true, upsert: false }
//       );

//       if (!updatedForm) {
//         return res.status(404).json({ message: "Session ID not found" });
//       }

//       return res.status(200).json({ message: "Data updated successfully" });
//     }
//   } catch (error) {
//     console.error("Error saving form data:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });




// app.get("/fetch-business-data", async (req, res) => {
//   let { businessName, clientName } = req.query;

//   if (!businessName && !clientName) {
//     return res.status(400).json({ message: "Either businessName or clientName is required" });
//   }

//   try {
//     // ✅ Construct dynamic query based on available parameters
//     let query = {};
    
//     if (businessName) {
//       query["AccountInformation.businessName"] = { $regex: `^${businessName}$`, $options: "i" };
//     }

//     if (clientName) {
//       query["AccountInformation.clientName"] = { $regex: `^${clientName}$`, $options: "i" };
//     }

//     // ✅ Fetch data based on query
//     const businessData = await FormData.find(query);

//     console.log("Query Result:", businessData);

//     if (!businessData.length) {
//       return res.status(404).json({ message: "No records found for the given criteria" });
//     }

//     return res.status(200).json({ message: "Business data fetched successfully", data: businessData });
//   } catch (error) {
//     console.error("Error fetching business data:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });





// Get all client names from FormData collection


app.get("/api/clients", async (req, res) => {
  try {
    // Fetch only client names from AccountInformation field
    const clients = await FormData.find(
      {},
      { "AccountInformation.clientName": 1, _id: 0 }
    );

    // Extract only client names into an array
    const clientNames = clients
      .map((client) => client.AccountInformation?.clientName)
      .filter((name) => name); // Filter out any null or undefined values

    res.status(200).json({ clientNames });
  } catch (error) {
    console.error("Error fetching client names:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get business names by client name
app.get("/api/businesses/:clientName", async (req, res) => {
  try {
    const clientName = req.params.clientName.trim(); // Remove any extra spaces

    console.log("\n Received clientName from request:", JSON.stringify(clientName));

    // Use regex without strict start and end anchors to allow matching with spaces
    const businesses = await FormData.find(
      { "AccountInformation.clientName": { $regex: clientName, $options: "i" } }, 
      { "AccountInformation.businessName": 1, _id: 0 }
    );

    console.log("🔍 Query sent to MongoDB:", JSON.stringify(businesses, null, 2));

    if (!businesses.length) {
      console.log(" No businesses found for client:", clientName);
      return res.status(404).json({ message: `No businesses found for client: '${clientName}'` });
    }

    const businessNames = businesses
      .map((business) => business.AccountInformation?.businessName)
      .filter((name) => name);

    console.log(" Found Business Names:", businessNames);

    res.status(200).json({ businessNames });
  } catch (error) {
    console.error(" Error fetching business names:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all users from another model (if needed)
app.get("/api/getUsers", (req, res) => {
  UserfetchModel.find()
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

/* ============================
   Employee Schema & Endpoints
   ============================ */

// Define Employee Schema (separate from your User schema)
const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    designation: { type: String, required: true },
    password: { type: String, required: true }, // In production, store a hashed password!
  },
  {
    collection: "employees", // Use a separate collection for employees
  }
);

// Create Employee Model
const Employee = mongoose.model("Employee", EmployeeSchema);

// Endpoint to register (create) a new employee
app.post("/api/employees/register", async (req, res) => {
  try {
    const { employeeId, name, email, designation, password } = req.body;

    // Create a new employee document
    const newEmployee = new Employee({
      employeeId,
      name,
      email,
      designation,
      password, // Remember: hash the password in a real app!
    });

    // Save to MongoDB
    await newEmployee.save();

    res.status(201).json({
      message: "Employee registered successfully",
      employee: newEmployee,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint to login an employee
// app.post("/api/employees/login", async (req, res) => {
//   try {
//     const { employeeId, password } = req.body;

//     // Find the employee with matching credentials
//     const employee = await Employee.findOne({ employeeId, password });

//     if (!employee) {
//       return res.status(401).json({ error: "Invalid employee credentials" });
//     }

//     // In a real application, you might generate and return a JWT token here
//     res.json({ success: true, employee });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Endpoint to get all employees
// app.get("/api/employees", async (req, res) => {
//   try {
//     const employees = await Employee.find({});
//     res.status(200).json(employees);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.post("/api/employees/login", async (req, res) => {
  try {
      const { employeeId, password } = req.body;
      const employee = await Employee.findOne({ employeeId, password });

      if (!employee) {
          return res.status(401).json({ error: "Invalid employee credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ employeeId: employee.employeeId }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.json({ success: true, token }); // ✅ Send token to the client
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

app.get("/api/employees", async (req, res) => {
  try {
      console.log("📢 Fetching employees...");
      const employees = await Employee.find({});
      res.status(200).json(employees);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


// DELETE endpoint to remove an employee by employeeId
app.delete("/api/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    // Find and remove the employee by employeeId
    const result = await Employee.findOneAndDelete({ employeeId });
    if (!result) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT endpoint to update an employee by employeeId
app.put("/api/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    // Update the employee with the new data from the request body
    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   Fetch Employee on Employee Dashboard
   ============================ */

// GET endpoint to retrieve a single employee by employeeId
app.get("/api/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT endpoint to update an employee by employeeId
app.put("/api/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST endpoint to create a task
app.post("/api/tasks", async (req, res) => {
  try {
    const { employeeId, taskTitle, taskDescription, dueDate } = req.body;
    const newTask = new Task({
      employeeId,
      taskTitle,
      taskDescription,
      dueDate,
      createdAt: new Date(),
    });
    await newTask.save();

    // Create a notification for the assigned employee.
    const newNotification = new Notification({
      employeeId,
      message: `You have been assigned a new task: ${taskTitle}`,
      createdAt: new Date(),
      read: false,
    });
    await newNotification.save();

    res.status(201).json({
      message: "Task assigned successfully",
      task: newTask,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update the route to use a query parameter
app.get("/api/tasks", async (req, res) => {
  try {
    const { employeeId } = req.query; // Note: now using req.query
    if (!employeeId) {
      return res
        .status(400)
        .json({ error: "employeeId query parameter is required" });
    }
    const tasks = await Task.find({ employeeId });
    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ error: "No tasks found for this employee" });
    }
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET endpoint to retrieve notifications for a particular employee
app.get("/api/notifications", async (req, res) => {
  try {
    const { employeeId } = req.query;
    const notifications = await Notification.find({ employeeId }).sort({
      createdAt: -1,
    });

    // Ensure every notification has a taskId
    const updatedNotifications = notifications.map((notif) => ({
      ...notif._doc, // Keep existing properties
      taskId: notif.taskId || `task-${notif._id}`, // Assign a unique dummy taskId if missing
    }));

    res.json(updatedNotifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/mark-notification-read", async (req, res) => {
  const { notificationId } = req.body;

  try {
    await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status" });
  }
});

/* ============================
   Start the Server
   ============================ */

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
