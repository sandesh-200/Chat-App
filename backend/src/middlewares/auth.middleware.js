import  jwt  from "jsonwebtoken"
import userModel from "../models/user.model.js"

export async function authUserMiddleware(req,res,next){
    let token = req.cookies.token
    
    // Support standard Authorization Bearer header (for mobile/ITP environments where cookies are blocked)
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            token = authHeader;
        }
    }

    if (!token) {
        return res.status(401).json({
            message:"Please login first"
        })
    }
    try {
       const decoded =  jwt.verify(token,process.env.JWT_SECRET)
       const user = await userModel.findById(decoded.id)
       req.user = user
       next()
    } catch (err) {
        return res.status(401).json({
            message:"Invalid token"
        })
    }
}