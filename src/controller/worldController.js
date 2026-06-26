import worldService from "../services/worldService.js";

const sendError = (res, error) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    errCode: 1,
    message: error.message || "Internal server error",
  });
};

const createWorld = async (req, res) => {
  try {
    const world = await worldService.createWorld(req.body);
    return res.status(201).json({
      errCode: 0,
      message: "World created successfully",
      data: world,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getWorldsByWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        if (!workspaceId) {
          return res.status(400).json({
            errCode: 1,
            message: "Missing required query parameter: workspaceId",
          });
        }
        const worlds = await worldService.getWorldsByWorkspace(workspaceId);
        return res.status(200).json({
          errCode: 0,
          message: "Worlds fetched successfully",
          data: worlds,
        });
      }
    catch (error) {
        return sendError(res, error);
    }
};

const getWorldGraph = async (req, res) => {
  try {
    // Nhận diện mã Tab qua tham số query trên thanh URL (Ví dụ: ?stageId=stage_2)
    const graph = await worldService.getWorldGraph(req.params.worldId, req.query);
    return res.status(200).json({
      errCode: 0,
      message: "World graph fetched successfully",
      data: graph,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const saveWorldGraph = async (req, res) => {
  try {
    const result = await worldService.saveWorldGraph(req.params.worldId, req.body);
    return res.status(200).json({
      errCode: 0,
      message: "World graph saved successfully",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export default {
  createWorld,
  getWorldsByWorkspace,
  getWorldGraph,
  saveWorldGraph,
};