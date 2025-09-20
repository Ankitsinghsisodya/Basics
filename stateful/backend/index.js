import express, { urlencoded } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import session from "express-session";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = [];

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 60 * 60 * 100,
    },
  })
);

const isAuthenticated = (req, res, next) => {
  if (req.user.session) {
    next();
  } else
    return res.status(401).json({
      message: "You are unauthorized",
    });
};

app.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({
        message: "username and password are required",
      });
    const existingUser = users.find((u) => u === username);
    if (existingUser)
      return res.status(409).json({ message: "Users already exists" });
    const hashedPassword = bcrypt.hash(password, 10);

    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
    };
    users.push(newUser);
    res.status(201).json({
      message: "user is created",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "error during user registration",
    });
  }
});

app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({
        message: "username and password are required",
      });

    const user = users.find((u) => u === username);
    if (!user)
      return res.status(401).json({
        message: "The users doesn't exists",
      });

    const isPasswordCorrect = bcrypt.compare(password, user.password);

    if (!isPasswordCorrect)
      return res.status(401).json({ message: "unauthorized access" });

    req.session.user = {
      id: user.id,
      username: user.username,
    };

    res.status(200).json({message:"Successful user login"})
  } catch (error) {
    res.status(500).json({
        message: "server error during login",
        error: error
    })
  }
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.status(200).json({
        message: `${req.session.user}`
    })
})

app.post('/logout', (req, res) => {
    try {
        req.session.destroy()
    } catch (error) {
        res.status(500).json({message: "server error during logout"})
    }
})
app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
