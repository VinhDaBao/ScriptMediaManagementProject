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

//Hàm truy xuất đồ thị sơ đồ theo tab world
const getWorldGraph = async (worldId, queryData = {} ) => {
    if (!isValidObjectId(worldId)) {
        throw buildValidationError("Invalid world id", 400);
    }
    const stageId = queryData.stageId || "stage_1";

    // Sử dụng findOneAndUpdate với upsert: true để nếu Workspace chưa có sơ đồ,
    // Hệ thống sẽ tự tạo mới một bản ghi kèm Tab mặc định là "Main Stage" luôn.
    const worldDoc = await World.findOneAndUpdate(
        { workspaceId: worldId },
        {
            $setOnInsert: {
                name: "Relationship Diagram",
                stages: [{ key: "stage_1", label: "Main Stage" }]
            }
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const [nodes, edges] = await Promise.all([
        WorldNode.find({ worldId, stageId }),
        WorldEdge.find({ worldId, stageId }),
    ]);

    return { nodes, edges, stages: worldDoc?.stages || [] };
};

// 2. Viết thêm hàm cập nhật danh sách cấu hình mảng Tab
const updateWorldStages = async (worldId, stages) => {
    if (!isValidObjectId(worldId)) {
        throw buildValidationError("Invalid world id", 400);
    }
    if (!Array.isArray(stages) || stages.length === 0) {
        throw buildValidationError("Stages must be a non-empty array", 400);
    }

    // Thêm upsert: true và $setOnInsert trường name (bắt buộc của Schema)
    // Để khi người dùng bấm Add Stage lần đầu tiên, DB sẽ tự sinh tài liệu World gốc.
    return await World.findOneAndUpdate(
        { workspaceId: worldId },
        {
            $set: { stages },
            $setOnInsert: { name: "Relationship Diagram" }
        },
        {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true
        }
    );
};

//Hàm lưu, cập nhật toàn bộ sơ đồ bằng cơ chế ghi đè dữ liệu theo tab
const saveWorldGraph = async (worldId, graphData) => {
    if (!isValidObjectId(worldId)) {
        throw buildValidationError("Invalid world id", 400);
    }

    const { nodes = [], edges = [], stageId = "stage_1" } = graphData;
    const nodeIdMapping = {};

    const nodesToInsert = nodes.map((node) => {
        const finalId = isValidObjectId(node.id)
                    ? new mongoose.Types.ObjectId(node.id)
                    : new mongoose.Types.ObjectId();

        nodeIdMapping[node.id] = finalId;

        return {
            _id: finalId,
            worldId: new mongoose.Types.ObjectId(worldId),
            stageId: stageId,
            name: node.name || node.data?.label || "Unnamed Node",
            description: node.description || node.data?.description || "",
            keyValues: node.keyValues || node.data?.keyValues || [],
            tags: node.tags || (node.data?.role ? [node.data.role] : []),
            avatarUrl: node.avatarUrl || node.data?.avatarUrl || "",
            position: {
                x: node.position?.x || 0,
                y: node.position?.y || 0,
            },
        };
    });

    const edgesToInsert = [];
    for (const edge of edges) {
        let fromId = nodeIdMapping[edge.source];
        let toId = nodeIdMapping[edge.target];

        if (!fromId && isValidObjectId(edge.source)) fromId = new mongoose.Types.ObjectId(edge.source);
        if (!toId && isValidObjectId(edge.target)) toId = new mongoose.Types.ObjectId(edge.target);

        if (!fromId || !toId) continue;

        edgesToInsert.push({
            worldId: new mongoose.Types.ObjectId(worldId),
            stageId: stageId,
            fromNodeId: fromId,
            toNodeId: toId,
            type: edge.label || edge.type || "Connected",
            color: edge.style?.stroke || "#3b82f6",
        });
    }

    try {
        // Thực hiện xóa sạch dữ liệu thuộc đúng phân đoạn Tab này trước khi nạp mới
        await Promise.all([
            WorldNode.deleteMany({ worldId, stageId }),
            WorldEdge.deleteMany({ worldId, stageId }),
        ]);

        const [savedNodes, savedEdges] = await Promise.all([
            WorldNode.insertMany(nodesToInsert),
            WorldEdge.insertMany(edgesToInsert),
        ]);

        return { nodes: savedNodes, edges: savedEdges };
    } catch (dbError) {
        // Nếu dính lỗi trùng chỉ mục độc nhất hoặc lỗi DB, ném ra ngoài để Controller bốc trả về lỗi 400 ngay lập tức
        console.error(">>> MongoDB overwrite error:", dbError.message);
        throw buildValidationError(`Database Sync Failed: ${dbError.message}`, 400);
    }
};

//Hàm xoá phân đoạn Stage
const deleteWorldStage = async (worldId, stageId) => {
    if (!isValidObjectId(worldId)) {
        throw buildValidationError("Invalid world id", 400);
    }
    if (!stageId) {
        throw buildValidationError("Missing stageId", 400);
    }

    // Xóa sạch tất cả các Node và Edge thuộc phân đoạn này
    await Promise.all([
        WorldNode.deleteMany({ worldId, stageId }),
        WorldEdge.deleteMany({ worldId, stageId })
    ]);

    return { message: "Stage data deleted successfully", stageId };
};

export default {
  createWorld,
  getWorldsByWorkspace,
  getWorldGraph,
  saveWorldGraph,
  deleteWorldStage,
  updateWorldStages
};