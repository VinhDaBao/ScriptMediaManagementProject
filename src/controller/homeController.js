import db from '../models/index'; 
import CRUDService from '../services/CRUDService'; 

let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll(); 
        return res.render('homepage.ejs', {
            data: JSON.stringify(data) 
        });
    } catch (e) {
        console.log(e);
    }
}

let getAboutPage = (req, res) => {
    return res.render('test/about.ejs');
}

// Gọi form thêm mới
let getCRUD = (req, res) => {
    return res.render('crud.ejs');
}

// Xử lý dữ liệu khi bấm nút thêm mới
let postCRUD = async (req, res) => { 
    let message = await CRUDService.createNewUser(req.body); 
    console.log(message);
    return res.send('Post crud to server');
}

// Lấy danh sách tất cả người dùng
let getFindAllCrud = async (req, res) => {
    let data = await CRUDService.getAllUser();
    return res.render('users/findAllUser.ejs', {
        datalist: data
    }); 
}

// Lấy dữ liệu của 1 người dùng để đưa lên form sửa
let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if (userId) { 
        let userData = await CRUDService.getUserInfoById(userId);
        return res.render('users/editUser.ejs', {
            data: userData
        });
    } else {
        return res.send('Unable to retrieve the ID');
    }
}

// Xử lý cập nhật thông tin
let putCRUD = async (req, res) => {
    let data = req.body;
    let data1 = await CRUDService.updateUser(data);
    return res.render('users/findAllUser.ejs', {
        datalist: data1
    });
}

// Xử lý xóa
let deleteCRUD = async (req, res) => {
    let id = req.query.id; 
    if(id) {
        await CRUDService.deleteUserById(id);
        return res.send('Deleted!!!!!!!!!!!!');
    } else {
        return res.send('Not find user');
    }
}

module.exports = { 
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    getFindAllCrud: getFindAllCrud,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD
}