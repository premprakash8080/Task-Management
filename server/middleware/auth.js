import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const auth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        throw new ApiError(401, "Not authorized to access this route");
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

        // Get user from token
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            throw new ApiError(401, "User not found");
        }

        next();
    } catch (error) {
        throw new ApiError(401, "Not authorized to access this route");
    }
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "Not authorized to access this route");
        }
        next();
    };
};

export { auth, authorize };