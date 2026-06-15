import mongoose from "mongoose";
import World from "../models/world.js";
import WorldNode from "../models/worldNode.js";
import WorldEdge from "../models/worldEdge.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// Tạo một sơ đồ mối quan hệ trong không gian làm việc
const createWorld = async (data) => {
  if (!data?.workspaceId || !data?.name) {
      throw buildValidationError("Missing required fields: workspaceId or name");
  }
  if (!isValidObjectId(data.workspaceId)) {
      throw buildValidationError("Invalid workspaceId");
  }
  return await World.create({
      workspaceId: data.workspaceId,
      name: data.name,
      description: data.description ?? "",
      tags: Array.isArray(data.tags) ? data.tags : [],
  });
};

//Lấy tất cả các mối quan hệ thuộc một Workspace
const getWorldsByWorkspace = async (workspaceId) => {
  if (!isValidObjectId(workspaceId)) {
      throw buildValidationError("Invalid workspaceId");
  }
  return await World.find({ workspaceId }).sort({ createdAt: -1 });
};

//Lấy toàn bộ dữ liệu cấu trúc Đồ thị (Nodes + Edges) của một World
const getWorldGraph = async (worldId) => {
    if (!isValidObjectId(worldId)) {
        throw buildValidationError("Invalid world id", 400);
    }
    const worldExists = await World.exists({ _id: worldId });
    if (!worldExists) {
        throw buildValidationError("World not found", 404);
    }

    const [nodes, edges] = await Promise.all([
        WorldNode.find({ worldId }),
        WorldEdge.find({ worldId }),
    ]);
    return { nodes, edges };
};

//Thuật toán quan trọng: Lưu/Cập nhật toàn bộ sơ đồ bằng cơ chế ghi đè dữ liệu
const saveWorldGraph = async (worldId, graphData) => {
    if (!isValidObjectId(worldId)) {
        throw buildValidationError("Invalid world id", 400);
    }

    const { nodes = [], edges = [] } = graphData;

    // Tạo bản đồ ánh xạ từ ID tạm của Frontend sang ObjectId xịn của Mongo
    const nodeIdMapping = {};

    const nodesToInsert = nodes.map((node) => {
        // Ép kiểu: Cho dù là ID cũ hay mới, đều ép về instance Types.ObjectId xịn
        const finalId = isValidObjectId(node.id)
                    ? new mongoose.Types.ObjectId(node.id)
                    : new mongoose.Types.ObjectId();

        // Lưu lại bản đồ ánh xạ, ví dụ: {"node_1": "6640beef..."}
        nodeIdMapping[node.id] = finalId;

        return {
            _id: finalId,
            worldId: new mongoose.Types.ObjectId(worldId), // Ép kiểu worldId
            name: node.name || node.data?.label || "Unnamed Node",
            description: node.description || "",
            keyValues: node.keyValues || [],
            tags: node.tags || [],
            position: {
                x: node.position?.x || 0,
                y: node.position?.y || 0,
            },
        };
    });

    const edgesToInsert = [];
    for (const edge of edges) {
        // Tìm ID chuẩn được ép kiểu ObjectId trong bảng ánh xạ
        let fromId = nodeIdMapping[edge.source];
        let toId = nodeIdMapping[edge.target];

        // Nếu không có trong bảng ánh xạ nhưng bản thân nó là ObjectId hợp lệ, thì tạo mới instance
        if (!fromId && isValidObjectId(edge.source)) fromId = new mongoose.Types.ObjectId(edge.source);
        if (!toId && isValidObjectId(edge.target)) toId = new mongoose.Types.ObjectId(edge.target);

        // Bỏ qua đường nối nếu không xác định được điểm đầu hoặc điểm cuối hợp lệ
        if (!fromId || !toId) continue;

        edgesToInsert.push({
            worldId: new mongoose.Types.ObjectId(worldId),
            fromNodeId: fromId,
            toNodeId: toId,
            type: edge.type || "RELATION",
        });
    }

    // Thực thi xóa sạch cũ - ghi đè mới trong database
    await Promise.all([
        WorldNode.deleteMany({ worldId }),
        WorldEdge.deleteMany({ worldId }),
    ]);

    const [savedNodes, savedEdges] = await Promise.all([
        WorldNode.insertMany(nodesToInsert),
        WorldEdge.insertMany(edgesToInsert),
    ]);

    return { nodes: savedNodes, edges: savedEdges };
};

export default {
  createWorld,
  getWorldsByWorkspace,
  getWorldGraph,
  saveWorldGraph,
};