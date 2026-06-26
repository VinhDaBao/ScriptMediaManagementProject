import userService from "../services/userService.js";
import User from "../models/user.js";

import Workspace from '../models/workspace.js';
import Subscription from '../models/subscription.js';
import Payment from '../models/payment.js';
import Asset from '../models/asset.js';
import mongoose from 'mongoose';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const handleForgotPassword = async (req, res) => {
    let email = req.body.email;
    if (!email) return res.status(200).json({ errCode: 1, message: 'Nhập Email!' });
    
    let response = await userService.sendOTPtoEmail(email);
    return res.status(200).json(response);
}

const handleVerifyForgotPasswordOTP = async (req, res) => {
    let response = await userService.verifyForgotPasswordOTP(req.body);
    return res.status(200).json(response);
}

const handleResetPassword = async (req, res) => {
    let response = await userService.resetPassword(req.body);
    return res.status(200).json(response);
}

const handleEditProfile = async (req, res) => {
    try {
        let data = req.body;
        if (req.file) {
            data.avatar = `/images/avatar/${req.file.filename}`;
        }
        let message = await userService.handleUpdateProfile(req.user, data);
        return res.status(200).json(message);
    } catch (e) {
        return res.status(200).json({ errCode: -1, message: 'Lỗi server...' });
    }
};

const handleToggleUserStatus = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        
        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ errCode: 1, message: 'Không tìm thấy người dùng này!' });
        }
        
        if (user.role === 'admin') {
            return res.status(403).json({ errCode: 2, message: 'Không thể khóa tài khoản của Admin khác!' });
        }

        // Đảo ngược trạng thái (Đang true thì thành false, đang false thì thành true)
        user.isActivated = !user.isActivated; 
        await user.save();

        const statusMessage = user.isActivated ? "Đã mở khóa tài khoản thành công!" : "Đã khóa tài khoản thành công!";
        return res.status(200).json({ errCode: 0, message: statusMessage, isActivated: user.isActivated });

    } catch (error) {
        console.error("Lỗi khóa tài khoản:", error);
        return res.status(500).json({ errCode: -1, message: 'Lỗi server khi cập nhật trạng thái User' });
    }
};

const getBillingInfo = async (req, res) => {
    try {
        // Lấy ID user từ token (middleware auth)
        const userId = req.user._id || req.user.id; 

        // 1. Kiểm tra gói Subscription đang ACTIVE
        const activeSub = await Subscription.findOne({ 
            userId, 
            status: "ACTIVE" 
        }).populate('planId');

        // 2. Cấu hình mặc định (FREE PLAN)
        let currentPlan = {
            name: "FREE PLAN",
            storageLimitMB: 500, // 500 MB
            workspaceLimit: 3    // 3 Workspace
        };

        // Nếu có gói Premium thì lấy thông số của gói đó
        if (activeSub && activeSub.planId) {
            currentPlan = {
                name: activeSub.planId.name,
                storageLimitMB: activeSub.planId.limits?.storageLimitMB || activeSub.planId.limits?.assets || 2048, 
                workspaceLimit: activeSub.planId.limits?.workspace || 9999
            };
        }

        // 3. Tính TỔNG DUNG LƯỢNG thực tế (Cộng dồn file trong tất cả Workspace của User)
        const userWorkspaces = await Workspace.find({ ownerId: userId }).select('_id');
        const workspaceIds = userWorkspaces.map(ws => ws._id);

        const storageAgg = await Asset.aggregate([
            { $match: { workspaceId: { $in: workspaceIds } } },
            { $group: { _id: "$type", totalSize: { $sum: "$fileSize" } } }
        ]);

        let totalUsedBytes = 0;
        let audioVideoBytes = 0;
        let imageBytes = 0;

        storageAgg.forEach(item => {
            const size = item.totalSize || 0;
            totalUsedBytes += size;
            if (item._id === 'AUDIO' || item._id === 'VIDEO') audioVideoBytes += size;
            else imageBytes += size; // IMAGE và FILE
        });

        // 4. Lấy Lịch sử thanh toán
        const payments = await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .populate('planId', 'name'); // Lấy thêm tên gói nếu có

        // 5. Trả dữ liệu về cho Frontend
        return res.status(200).json({
            errCode: 0,
            data: {
                plan: currentPlan,
                storage: {
                    totalUsedBytes,
                    audioVideoBytes,
                    imageBytes,
                    limitBytes: currentPlan.storageLimitMB * 1024 * 1024
                },
                payments
            }
        });

    } catch (error) {
        console.error("Billing Info Error:", error);
        return res.status(500).json({ errCode: -1, message: "Lỗi lấy thông tin dung lượng" });
    }
};

const handleGetAllUsers = async (req, res) => {
    try {
        const queryParams = {
            search: req.query.search || '',
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sortBy: req.query.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder || 'desc'
        };

        // Đẩy hết mớ bòng bong qua Service xử lý
        const data = await userService.getAllUsersAdmin(queryParams);
        
        return res.status(200).json({ errCode: 0, data });
    } catch (error) {
        console.error('Lỗi lấy danh sách user:', error);
        return res.status(500).json({ errCode: 1, message: 'Lỗi server' });
    }
};

// ==========================================
// THÊM: CONTROLLER THỐNG KÊ DASHBOARD
// ==========================================
const handleGetDashboardStats = async (req, res) => {
    try {
        // Lấy kết quả từ Service
        const data = await userService.getAdminDashboardStats();
        
        return res.status(200).json({ errCode: 0, data });
    } catch (error) {
        console.error('Lỗi lấy thống kê Dashboard:', error);
        return res.status(500).json({ errCode: 1, message: 'Lỗi server' });
    }
};

export default {
    handleForgotPassword,
    handleVerifyForgotPasswordOTP,
    handleResetPassword,
    handleEditProfile,
    handleToggleUserStatus,
    getBillingInfo,
    handleGetAllUsers,
    handleGetDashboardStats 
};