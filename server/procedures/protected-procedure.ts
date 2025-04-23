import publicProcedure from "./public-procedure";
import { authMiddleware } from "../middleware/auth";

// Protected procedure requires authentication but not a specific role
const authProcedure = publicProcedure.use(authMiddleware);

export default authProcedure;
