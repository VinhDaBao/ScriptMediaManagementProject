# Bài tập thực hành tuần 02 - BT01 - CRUD NODE.JS & MYSQL 

## Thông tin sinh viên
* **Họ và tên:** Trương Quang Điệp
* **Môn học:** Công nghệ phần mềm mới (MTSE431179)
* **Công nghệ sử dụng:** `Node.js`, `Express`, `Sequelize`, `MySQL`, `EJS`

## Cấu trúc thư mục (Simplified)
Để dễ theo dõi, đây là cấu trúc các file chính trong thư mục `src`:

```text
src/
├── config/             # Cấu hình Database & View Engine
├── controller/         # Điều hướng request và gọi Service
├── migrations/         # Các file tạo bảng tự động trong MySQL
├── models/             # Định nghĩa cấu trúc các bảng (Sequelize Models)
├── route/              # Khai báo các đường dẫn URL (Routes)
├── services/           # Xử lý logic nghiệp vụ CRUD chính
├── views/              # Giao diện người dùng (EJS Templates)
└── server.js           # File khởi chạy server chính

## Hướng dẫn cài đặt & Chạy dự án
npm install

## Cấu hình Database:
Sửa thông tin tài khoản MySQL trong file src/config/config.json.

## Tạo Database và Bảng:
npx sequelize-cli db:create
npx sequelize-cli db:migrate

## Khởi chạy Server:
npm start

Truy cập: http://localhost:8088/crud để test chức năng.