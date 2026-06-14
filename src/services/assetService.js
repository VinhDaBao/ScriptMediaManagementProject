import Asset from '../models/asset.js'; 
import Workspace from '../models/workspace.js';

// 1. Service Upload
export const createAssetService = async (data) => {
    try {
        const newAsset = new Asset(data);
        const savedAsset = await newAsset.save();
        return savedAsset;
    } catch (error) {
        throw error; 
    }
};

// 2. Service Lấy danh sách
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

export const getUniqueTagsService = async (workspaceId) => {
    try {
        // Hàm distinct sẽ gom tất cả các tags lại, loại bỏ những tag trùng nhau
        const tags = await Asset.distinct('tags', { workspaceId: workspaceId });
        return tags;
    } catch (error) {
        throw error;
    }
};

export const updateAssetService = async (assetId, updateData) => {
    try {
        // { new: true } để nó trả về cục data MỚI SAU KHI SỬA
        const updatedAsset = await Asset.findByIdAndUpdate(assetId, updateData, { new: true });
        return updatedAsset;
    } catch (error) {
        throw error;
    }
};

export const deleteAssetService = async (assetId) => {
    try {
        const deletedAsset = await Asset.findByIdAndDelete(assetId);
        return deletedAsset;
    } catch (error) {
        throw error;
    }
};