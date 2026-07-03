import express from "express";
import worldController from "../controller/worldController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tất cả các thao tác liên quan tới sơ đồ thế giới đều bắt buộc phải đăng nhập
router.use(authMiddleware);

router.post('/create', worldController.createWorld);
router.get('/list', worldController.getWorldsByWorkspace);

router.get('/graph/:worldId', worldController.getWorldGraph);
router.post('/graph/save/:worldId', worldController.saveWorldGraph);

router.delete('/graph/delete-stage/:worldId', worldController.deleteWorldStage);
router.put('/graph/stages/:worldId', worldController.updateWorldStages);
export default router;