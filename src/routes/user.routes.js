import {Router} from "express";
import {registerUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {loginUser} from "../controllers/user.controller.js";
import {logoutUser} from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {refreshAccessToken} from "../controllers/user.controller.js";
import {getCurrentUser} from "../controllers/user.controller.js";
import {updateUserProfile} from "../controllers/user.controller.js";
import {changeCurrentPassword} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
    upload.fields([
      {
        name:"avatar",maxCount:1
      },
    
    ]),
    registerUser);
    router.route("/login").post(loginUser);
    router.route("/logout").post(verifyJWT, logoutUser);
    router.route("/refresh-token").post(refreshAccessToken);
    router.route("/profile").get(verifyJWT,getCurrentUser);
    router.route("/update-profile").patch(verifyJWT,updateUserProfile);
    router.route("/change-password").patch(verifyJWT,changeCurrentPassword);
export  default router;