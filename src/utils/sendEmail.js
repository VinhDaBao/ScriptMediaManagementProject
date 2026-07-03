import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true, // Dùng SSL cho port 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"SMM Project" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Account Registration Verification Code',
        text: `Your OTP code is: ${otp}. This code is valid for 5 minutes.`,
    };

    return await transporter.sendMail(mailOptions);
};