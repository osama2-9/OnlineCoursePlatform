import { prisma } from "../prisma/prismaClint.s";

const createReview = async (req ,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error:"Internal server error"
        })
        
        
    }
}
