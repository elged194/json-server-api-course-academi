const jsonServer = require("json-server");
const auth = require("json-server-auth");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

app.use(cors());
app.use(middlewares);
app.use(jsonServer.bodyParser);

// -----------------/ post - register  /----------------------
// Route for user registration with password hashing
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user already exists
    const users = router.db.get("users").value();
    const userExists = users.some((user) => user.email === email);

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user
    const newUser = { ...req.body, password: hashedPassword };
    router.db.get("users").push(newUser).write();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------/ put /----------------------
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    // Check if password needs to be updated and hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Debugging: log data
    console.log("Updating user with id:", id);
    console.log("User data:", userData);

    // Update the user in the database
    const updatedUser = router.db
      .get("users")
      .find({ id: parseInt(id) })
      .assign(userData)
      .write();

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});


// قاعده التحكم في الأذونات
const rules = auth.rewriter({
  users: 777, // فقط المستخدم المسجل يمكنه الوصول إلى البيانات
  products: 777, // السماح بأوامر GET و POST و DELETE فقط
});

// Routes for authentication
app.use(auth);
app.use(router);
app.use(rules);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
