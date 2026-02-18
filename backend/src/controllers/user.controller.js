import userModel from "../models/user.model.js";
import { getPagination } from "../utils/getPagination.js";

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const { page, limit, skip } = getPagination(req.query);

    const filter = {
      _id: { $ne: loggedInUserId }
    };

    const [users, total] = await Promise.all([
      userModel
        .find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      userModel.countDocuments(filter)
    ]);

    res.status(200).json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message
    });
  }
};


export const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};