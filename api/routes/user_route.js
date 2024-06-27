import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
    deleteUser,
    getUsers,
    search, 
    signout,
    test,
    getUser,
    updateUser,
    updateUserByadmin,
  } from '../controller/user_controller.js';

const router = express.Router();

router.get("/test", test);
router.put("/update/:userId", verifyToken, updateUser);
router.put("/updateUserByadmin/:userId", verifyToken, updateUserByadmin);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.post("/signout", signout);
router.get('/getusers', verifyToken, getUsers);
router.get('/search',verifyToken, search);
router.get('/getUser',verifyToken, getUser);


export default router;