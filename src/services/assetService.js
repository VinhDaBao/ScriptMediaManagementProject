import Asset from '../models/asset.js'; 
import Workspace from '../models/workspace.js';
import { cloudinary } from '../config/cloudinary.js'; // BỔ SUNG: Import thư viện cloudinary

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

// 3. Service Lấy Tags
export const getUniqueTagsService = async (workspaceId) => {
    try {
        // Hàm distinct sẽ gom tất cả các tags lại, loại bỏ những tag trùng nhau
        const tags = await Asset.distinct('tags', { workspaceId: workspaceId });
        return tags;
    } catch (error) {
        throw error;
    }
};

// 4. Service Cập nhật (Đã bổ sung logic xóa file cũ trên Cloudinary nếu up file mới)
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

        // { new: true } để nó trả về cục data MỚI SAU KHI SỬA
        const updatedAsset = await Asset.findByIdAndUpdate(assetId, updateData, { new: true });
        return updatedAsset;
    } catch (error) {
        throw error;
    }
};

// 5. Service Xóa (Nâng cấp hàm xóa file trên Cloudinary)
export const deleteAssetService = async (assetId) => {
    try {
        // 1. Tìm tài nguyên trong database để lấy publicId
        const asset = await Asset.findById(assetId);
        
        if (!asset) {
            return null;
        }

        // 2. Xóa file thực tế trên Cloudinary
        if (asset.publicId) {
            // Xác định resource_type dựa trên loại file (video/audio hoặc file thường)
            let resourceType = 'image';
            if (asset.type === 'VIDEO' || asset.type === 'AUDIO') {
                resourceType = 'video';
            } else if (asset.type === 'FILE') {
                resourceType = 'raw';
            }

            await cloudinary.uploader.destroy(asset.publicId, { resource_type: resourceType });
        }

        // 3. Xóa record trong database sau khi xóa trên mây thành công
        const deletedAsset = await Asset.findByIdAndDelete(assetId);
        return deletedAsset;
    } catch (error) {
        throw error;
    }
};