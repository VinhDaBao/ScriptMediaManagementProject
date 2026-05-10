import express from 'express';
import userController from '../controller/userController';

let router = express.Router();

let initApiRoutes = (app) => {
	
	router.post('/api/forgot-password', userController.handleForgotPassword);
	router.post('/api/reset-password', userController.handleResetPassword);
    router.put('/api/edit-profile', userController.handleEditProfile);

	return app.use('/', router);
}

module.exports = initApiRoutes;