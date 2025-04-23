import { loggerMiddleware } from "../middleware/logger";
import { procedure } from "../trpc";
const publicProcedure = procedure;

export default publicProcedure.use(loggerMiddleware);
