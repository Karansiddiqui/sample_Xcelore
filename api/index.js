import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user_route.js";
import authRoutes from "./routes/auth_route.js";
import cookieParser from "cookie-parser";
import path from 'path';


dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT;
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB is connected");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();


app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})

// error handlers middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
      success: false,
      statusCode,
      message
  });
})