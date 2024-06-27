import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import User from "../models/user_model.js";
export const test = (req, res) => {
  res.send("API is Working");
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }

  console.log(req.body.username + "   " + req.body.password);

  if (!req.body.password && !req.body.username) {
    return next(errorHandler(400, "Please fill username or password"));
  }
  if (req.body.password) {
    if (req.body.password.length < 4) {
      return next(errorHandler(400, "Password must be at least 4 characters"));
    }
    if (req.body.password.includes(" ")) {
      return next(errorHandler(400, "Password cannot contain spaces"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  } else {
    delete req.body.password;
    if (!req.body.username) {
      next(errorHandler(400, "Please fill password"));
    }
  }

  if (req.body.username) {
    if (req.body.username.length < 4 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 4 and 20 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
  } else {
    delete req.body.username;
    if (!req.body.password) {
      next(errorHandler(400, "Please fill Username"));
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    const customError = new Error("Username already exists");
    next(customError);
  }
};

export const deleteUser = async (req, res, next) => {
  console.log(req.params.userId);
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this user"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};


export const updateUserByadmin = async (req, res, next) => {

  console.log(req.body.username + "   " + req.body.password);

  if (!req.body.password && !req.body.username) {
    return next(errorHandler(400, "Please fill username or password"));
  }
  if (req.body.password) {
    if (req.body.password.length < 4) {
      return next(errorHandler(400, "Password must be at least 4 characters"));
    }
    if (req.body.password.includes(" ")) {
      return next(errorHandler(400, "Password cannot contain spaces"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  } else {
    delete req.body.password;
    if (!req.body.username) {
      next(errorHandler(400, "Please fill password"));
    }
  }

  if (req.body.username) {
    if (req.body.username.length < 4 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 4 and 20 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
  } else {
    delete req.body.username;
    if (!req.body.password) {
      next(errorHandler(400, "Please fill Username"));
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    const customError = new Error("Username already exists");
    next(customError);
  }
};


export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    res.status(200).json({
      users: usersWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const search = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }
  try {
    const limit = parseInt(req.query.limit) || 9;
    const users = await User.find(
      (req.query.searchTerm && {
        username: { $regex: req.query.searchTerm, $options: "i" },
      })
    ).limit(limit);;

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    res.status(200).json({
      users: usersWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.query.userId);


      const { password, ...rest } = user._doc;
// console.log(rest);
    res.status(200).json({
      user: rest,
    });
  } catch (error) {
    next(error);
  }
};
