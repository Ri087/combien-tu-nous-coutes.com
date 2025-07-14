import { authMiddleware } from "../middleware/auth";
import publicProcedure from "./public-procedure";

// Protected procedure requires authentication but not a specific role
const authProcedure = publicProcedure.use(authMiddleware);

export default authProcedure;
