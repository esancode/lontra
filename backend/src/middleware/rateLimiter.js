import rateLimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {
        const { success } = await rateLimit.limit("my-limit-key");

        if (!success) {
            return res.status(429).json({
                message: "too many reques, please try again later"
            })
        }

        next();
    } catch (error) {
        res.status(500).json({
            message: "Internal server error in rate limiter"
        });
        next(error);
    }
}

export default rateLimiter;