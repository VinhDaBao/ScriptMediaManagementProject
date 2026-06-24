import * as assetService from '../services/assetService.js';
import mongoose from 'mongoose';
import Workspace from '../models/workspace.js';
import Subscription from '../models/subscription.js';
import Asset from '../models/asset.js';

// 1. HÀM UPLOAD ASSET (ĐÃ TÍCH HỢP SOFT LIMIT)
export const uploadAsset = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ errCode: 1, message: "Không tìm thấy file upload!" });
        }

        

        const { workspaceId, tags } = req.body;
        
        // =========================================================
        // 🔥 LOGIC KIỂM TRA DUNG LƯỢNG (SOFT LIMIT & DEFAULT FREE) 🔥
        // =========================================================
        if (workspaceId) {
            // 1. Tìm Workspace để biết ai là Chủ (Owner)
            const workspace = await Workspace.findById(workspaceId);
            if (!workspace) {
                return res.status(404).json({ errCode: 1, message: "Workspace không tồn tại" });
            }

            // 2. Kiểm tra gói Subscription đang ACTIVE của Chủ Workspace
            const activeSub = await Subscription.findOne({ 
                userId: workspace.ownerId, 
                status: "ACTIVE" 
            }).populate('planId');

            // 3. Mặc định là gói FREE (Ví dụ: 500MB) nếu không có Subscription
            let limitMB = 500; 
            if (activeSub && activeSub.planId && activeSub.planId.limits) {
                limitMB = activeSub.planId.limits.storageLimitMB || 500; // Lấy dung lượng gói Premium
            }
            const limitBytes = limitMB * 1024 * 1024; // Đổi MB sang Bytes

            // 4. Tính tổng dung lượng (fileSize) các tài nguyên hiện có trong Workspace
            const sizeAggregation = await Asset.aggregate([
                { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
                { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
            ]);
            
            const currentTotalSize = sizeAggregation.length > 0 ? sizeAggregation[0].totalSize : 0;
            const newFileSize = req.file.size; // Kích thước của file đang chuẩn bị up lên

            // 5. Kích hoạt Soft Limit: Chặn không cho Up nếu vượt Quota
            if (currentTotalSize + newFileSize > limitBytes) {
                return res.status(403).json({ 
                    errCode: 403, 
                    message: `Không thể tải lên! Giới hạn của bạn là ${limitMB}MB, nhưng hiện đã dùng ${Math.round(currentTotalSize / (1024 * 1024))}MB. Vui lòng nâng cấp gói hoặc xóa bớt tài nguyên.` 
                });
            }
        }
        // =========================================================

        let fileType = 'FILE';
        if (req.file.mimetype.startsWith('audio')) fileType = 'AUDIO';
        else if (req.file.mimetype.startsWith('video')) fileType = 'VIDEO';
        else if (req.file.mimetype.startsWith('image')) fileType = 'IMAGE';

        const assetData = {
            workspaceId: workspaceId || null, 
            type: fileType,
            url: req.file.path,
            fileName: req.file.originalname,
            fileSize: req.file.size, // LƯU THÊM KÍCH THƯỚC FILE
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [], 
            isFavorite: false
        };

        const newAsset = await assetService.createAssetService(assetData);

        return res.status(200).json({
            errCode: 0,
            message: "Upload tài nguyên thành công!",
            asset: newAsset
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return res.status(500).json({ errCode: -1, message: "Lỗi server khi upload file" });
    }
};

// 2. HÀM GET ALL ASSETS (GIỮ NGUYÊN)
export const getAllAssets = async (req, res) => {
    try {
        const { workspaceId, type, search, sort } = req.query;

        if (!workspaceId) {
            return res.status(400).json({ errCode: 1, message: "Thiếu workspaceId!" });
        }

        const assets = await assetService.getAssetsService(workspaceId, type, search, sort);

        return res.status(200).json({
            errCode: 0,
            message: "Lấy danh sách tài nguyên thành công!",
            total: assets.length,
            data: assets
        });

    } catch (error) {
        console.error("GET Assets Error:", error);
        return res.status(500).json({ errCode: -1, message: "Lỗi server khi lấy tài nguyên" });
    }
};

// 3. HÀM LẤY TAGS (GIỮ NGUYÊN)
export const getWorkspaceTags = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        if (!workspaceId) return res.status(400).json({ errCode: 1, message: "Thiếu workspaceId" });

        const tags = await assetService.getUniqueTagsService(workspaceId);
        return res.status(200).json({ errCode: 0, data: tags });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: "Lỗi khi lấy tags" });
    }
};

// 4. HÀM CẬP NHẬT ASSET (GIỮ NGUYÊN)
export const updateAsset = async (req, res) => {
    try {
        const { id } = req.params; 
        const { fileName, tags, workspaceId, isFavorite } = req.body; 

        let updateData = {};
        if (fileName) updateData.fileName = fileName;
        if (tags) updateData.tags = tags; 
        if (workspaceId) updateData.workspaceId = workspaceId; 
        if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

        const updatedAsset = await assetService.updateAssetService(id, updateData);

        if (!updatedAsset) {
            return res.status(404).json({ errCode: 1, message: "Không tìm thấy tài nguyên này!" });
        }

        return res.status(200).json({ errCode: 0, message: "Cập nhật thành công!", data: updatedAsset });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: "Lỗi cập nhật tài nguyên" });
    }
};

// 5. HÀM XÓA ASSET (GIỮ NGUYÊN)
export const deleteAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAsset = await assetService.deleteAssetService(id);

        if (!deletedAsset) {
            return res.status(404).json({ errCode: 1, message: "Không tìm thấy tài nguyên để xóa!" });
        }

        return res.status(200).json({ errCode: 0, message: "Đã xóa tài nguyên!" });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: "Lỗi khi xóa tài nguyên" });
    }
};