let UserAuth = {};
import authRoutes from "./routes/auth.routes.mjs";
import middleware from "./middleware/index.mjs";

UserAuth.authRoutes = authRoutes;
UserAuth.middleware = middleware;


export default UserAuth;