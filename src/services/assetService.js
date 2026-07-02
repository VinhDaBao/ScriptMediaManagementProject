import Asset from '../models/asset.js'; 
import Workspace from '../models/workspace.js';
import { v2 as cloudinary } from 'cloudinary'; 

// 1. Service Upload (Giữ nguyên)
export const createAssetService = async (data) => {
    try {
        const newAsset = new Asset(data);
        const savedAsset = await newAsset.save();
        return savedAsset;
    } catch (error) {
        throw error; 
    }
};

// 2. Service Lấy danh sách (Giữ nguyên)
export const getAssetsService = async (workspaceId, type, search, sort) => {
    try {
        let queryFilter = { workspaceId: workspaceId };

        if (type && type !== 'all') {
            queryFilter.type = type.toUpperCase();
        }

        if (search) {
            queryFilter.$or = [
                { fileName: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } } 
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const assets = await Asset.find(queryFilter).sort(sortOption).populate('workspaceId', 'name');
        return assets;
    } catch (error) {
        throw error;
    }
};

// 3. Service Lấy Tags (Giữ nguyên)
export const getUniqueTagsService = async (workspaceId) => {
    try {
        const tags = await Asset.distinct('tags', { workspaceId: workspaceId });
        return tags;
    } catch (error) {
        throw error;
    }
};

// 4. Service Cập nhật (Đã bổ sung logic xóa file cũ nếu có up file mới)
export const updateAssetService = async (assetId, updateData) => {
    try {
        // NẾU LUỒNG UPDATE CÓ THAY ĐỔI FILE MỚI:
        // Controller sẽ truyền URL và publicId mới vào updateData.
        // Ta cần tìm file cũ để xóa trên Cloudinary trước khi ghi đè.
        if (updateData.url && updateData.publicId) {
            const oldAsset = await Asset.findById(assetId);
            if (oldAsset && oldAsset.publicId) {
                // Determine resource type (Cloudinary cần cái này để xóa video/audio)
                const resourceType = (oldAsset.type === 'VIDEO' || oldAsset.type === 'AUDIO') ? 'video' : 'image';
                await cloudinary.uploader.destroy(oldAsset.publicId, { resource_type: resourceType });
            }
        }

        const updatedAsset = await Asset.findByIdAndUpdate(assetId, updateData, { new: true });
        return updatedAsset;
    } catch (error) {
        throw error;
    }
};

export const deleteAssetService = async (assetId) => {
    try {
        // BƯỚC 1: Tìm thông tin asset trong DB trước
        const assetToDelete = await Asset.findById(assetId);
        if (!assetToDelete) {
            throw new Error("Không tìm thấy tài nguyên để xóa");
        }

        // BƯỚC 2: Xóa file vật lý trên Cloudinary (nếu có publicId)
        if (assetToDelete.publicId) {
            // Lưu ý: Cloudinary coi Audio và Video chung một type là 'video' khi xóa
            const resourceType = (assetToDelete.type === 'VIDEO' || assetToDelete.type === 'AUDIO') ? 'video' : 'image';
            
            await cloudinary.uploader.destroy(assetToDelete.publicId, { resource_type: resourceType });
        }

        // BƯỚC 3: Xóa record trong Database
        const deletedAsset = await Asset.findByIdAndDelete(assetId);
        return deletedAsset;
    } catch (error) {
        throw error;
    }
};