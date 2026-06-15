import * as assetService from '../services/assetService.js';

export const uploadAsset = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ errCode: 1, message: "Không tìm thấy file upload!" });
        }

        const { workspaceId, tags } = req.body;
        
        let fileType = 'FILE';
        if (req.file.mimetype.startsWith('audio')) fileType = 'AUDIO';
        else if (req.file.mimetype.startsWith('video')) fileType = 'VIDEO';
        else if (req.file.mimetype.startsWith('image')) fileType = 'IMAGE';

        const assetData = {
            workspaceId: workspaceId || null, 
            type: fileType,
            url: req.file.path,
            fileName: req.file.originalname,
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

export const updateAsset = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID của file cần sửa trên URL
        const { fileName, tags, workspaceId, isFavorite } = req.body; // Dữ liệu cần sửa

        // Đóng gói data cần update (Frontend gửi lên gì thì mình sửa nấy)
        let updateData = {};
        if (fileName) updateData.fileName = fileName;
        if (tags) updateData.tags = tags; 
        if (workspaceId) updateData.workspaceId = workspaceId; // Dùng cho tính năng Move Workspace
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