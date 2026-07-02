import express from "express"; //gọi Express
import homeController from "../controller/homeController"; //gọi controller

let router = express.Router(); //khởi tạo Route

let initWebRoutes = (app) => { 
    
    router.get('/', (req, res) => {
        return res.send('Home');
    });

    // gọi hàm trong controller
    router.get('/home', homeController.getHomePage); 
    router.get('/about', homeController.getAboutPage); 
    router.get('/crud', homeController.getCRUD); 
    router.post('/post-crud', homeController.postCRUD); 
    router.get('/get-crud', homeController.getFindAllCrud); 
    router.get('/edit-crud', homeController.getEditCRUD); 
    router.post('/put-crud', homeController.putCRUD); 
    router.get('/delete-crud', homeController.deleteCRUD); 

    return app.use("/", router); //url mặc định
}

module.exports = initWebRoutes;