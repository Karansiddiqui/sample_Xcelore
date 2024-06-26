import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
    deleteUser,
    getUsers,
    getUser, 
    signout,
    test,
    updateUser,
  } from '../controller/user_controller.js';

const router = express.Router();

router.get("/test", test);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.post("/signout", signout);
router.get('/getusers', verifyToken, getUsers);
router.get('/search',verifyToken, getUser);


export default router;