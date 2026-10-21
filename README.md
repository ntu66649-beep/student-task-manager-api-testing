# 📚 Student Task Manager – API Testing with Postman (SWT301)

Dự án REST API đơn giản và bộ kiểm thử tự động (Automated API Testing) bằng Postman phục vụ cho môn học **SWT301 - Software Testing**.

---

## 📌 1. Giới thiệu dự án

Dự án mô phỏng hệ thống quản lý nhiệm vụ học tập của sinh viên (**Student Task Manager**), cung cấp các API RESTful phục vụ cho việc kiểm thử tự động, kèm theo giao diện web quản lý học tập với tổng quan tiến độ và đầy đủ thao tác nhiệm vụ qua REST API.

- **Backend:** Node.js, Express.js.
- **Frontend:** HTML, CSS, JavaScript thuần (kết nối REST API qua `fetch()`, không lưu task vào `localStorage`).
- **Công cụ kiểm thử:** Postman (Collection + Tests Scripts), Newman CLI (tùy chọn).
- **Lưu trữ dữ liệu:** In-Memory Mock Data (không cần cài đặt cơ sở dữ liệu phức tạp).
- **Cơ chế xác thực:** Bearer Token (Mock JWT).

---

## 2. Cấu trúc thư mục

```text
student-task-manager-api-testing/
├── postman/                                          # File kiểm thử Postman
│   ├── Student_Task_Manager_API.postman_collection.json     # Postman Collection v2.1.0 (kèm tests script)
│   └── Student_Task_Manager_Environment.postman_environment.json # Postman Environment
├── public/                                           # Giao diện Website minh họa REST API
│   ├── css/
│   │   └── style.css                                 # Giao diện navy/cam, sáng/tối, responsive
│   ├── js/
│   │   └── app.js                                    # Logic kết nối API qua fetch()
│   └── index.html                                    # Trang chủ (Login & Dashboard)
├── src/                                              # Mã nguồn ứng dụng backend
│   ├── data/
│   │   └── tasks.data.js                             # Dữ liệu mẫu ban đầu (Mock Data)
│   ├── middleware/
│   │   └── auth.middleware.js                        # Middleware kiểm tra Bearer Token
│   ├── routes/
│   │   ├── auth.routes.js                            # API Đăng nhập (Login)
│   │   └── task.routes.js                            # API CRUD Nhiệm vụ (Tasks)
│   ├── app.js                                        # Cấu hình Express app & static server
│   └── server.js                                     # Khởi động Web Server (Port 3000)
├── test/
│   └── api.test.js                                   # Script kiểm thử tự động bằng Node.js
├── .gitignore                                        # Bỏ qua node_modules
├── package.json                                      # Thông tin dự án và dependencies
└── README.md                                         # Hướng dẫn chi tiết
```

---

## 🚀 3. Hướng dẫn cài đặt và khởi chạy

### Yêu cầu hệ thống:
- Đã cài đặt **Node.js** (khuyến nghị phiên bản 18+ hoặc 20+).

### Bước 1: Cài đặt thư viện phụ thuộc
Mở terminal tại thư mục dự án (`G:\Projects\student-task-manager-api-testing`):
```bash
npm install
```

### Bước 2: Khởi động API Server
```bash
npm start
```
Server sẽ chạy tại địa chỉ: `http://localhost:3000`

> **Chế độ phát triển (Auto reload):** `npm run dev`

### Bước 3: Chạy kiểm thử tự động nhanh (Không cần mở Postman)
Dự án được trang bị sẵn script kiểm thử 15/15 test case:
```bash
npm test
```

---

## 📋 4. Danh sách API (API Specifications)

### Tài khoản đăng nhập mẫu:
- **Username:** `student`
- **Password:** `password123`
- **Token hợp lệ:** `mock-token-swt301-xyz123`

| STT | Phương thức | Đường dẫn API | Xác thực (Auth) | Mô tả chức năng | Mã trạng thái mong đợi |
|:---:|:---:|:---|:---:|:---|:---:|
| 1 | `GET` | `/api/health` | Không | Kiểm tra trạng thái hoạt động của Server | 200 OK |
| 2 | `POST` | `/api/login` | Không | Đăng nhập hệ thống & lấy Token | 200 OK / 400 Bad Request / 401 Unauthorized |
| 3 | `GET` | `/api/tasks` | Bearer Token | Lấy danh sách tất cả các nhiệm vụ | 200 OK / 401 Unauthorized |
| 4 | `GET` | `/api/tasks/:id` | Bearer Token | Lấy thông tin chi tiết một nhiệm vụ theo ID | 200 OK / 404 Not Found |
| 5 | `POST` | `/api/tasks` | Bearer Token | Thêm nhiệm vụ mới | 201 Created / 400 Bad Request |
| 6 | `PUT` | `/api/tasks/:id` | Bearer Token | Cập nhật thông tin nhiệm vụ | 200 OK / 400 Bad Request / 404 Not Found |
| 7 | `DELETE` | `/api/tasks/:id` | Bearer Token | Xóa nhiệm vụ theo ID | 200 OK / 404 Not Found |
| 8 | `POST` | `/api/reset` | Không | Reset lại dữ liệu mẫu ban đầu | 200 OK |

---

## 🧪 5. Ma trận Test Cases trong Postman Collection

Collection bao gồm đầy đủ kịch bản kiểm thử **Thành công (Positive)** và **Thất bại (Negative)**:

| Mã TC | Tên Test Case | Method & Endpoint | Kịch bản kiểm thử | HTTP Status | Kết quả mong đợi |
|:---:|:---|:---|:---|:---:|:---|
| **TC01** | Login - Success | `POST /api/login` | Nhập đúng `student` / `password123` | **200 OK** | Trả về token; tự động lưu vào biến `token` |
| **TC02** | Login - Invalid Credentials | `POST /api/login` | Nhập sai mật khẩu | **401 Unauthorized** | Báo lỗi thông tin đăng nhập không hợp lệ |
| **TC03** | Login - Missing Fields | `POST /api/login` | Thiếu trường `password` | **400 Bad Request** | Báo lỗi thiếu trường bắt buộc |
| **TC04** | Get Tasks - Success | `GET /api/tasks` | Có Token hợp lệ | **200 OK** | Trả về danh sách danh mục nhiệm vụ |
| **TC05** | Get Tasks - No Token | `GET /api/tasks` | Không truyền Header Authorization | **401 Unauthorized** | Bị từ chối truy cập |
| **TC06** | Get Task By ID - Success | `GET /api/tasks/1` | ID tồn tại (ID: 1) | **200 OK** | Trả về thông tin chi tiết task ID 1 |
| **TC07** | Get Task By ID - Not Found | `GET /api/tasks/9999`| ID không tồn tại | **404 Not Found** | Báo lỗi không tìm thấy task |
| **TC08** | Add Task - Success | `POST /api/tasks` | Đủ thông tin hợp lệ | **201 Created** | Tạo task mới; lưu `createdTaskId` vào biến |
| **TC09** | Add Task - Missing Title | `POST /api/tasks` | Không truyền `title` | **400 Bad Request** | Báo lỗi trường `title` là bắt buộc |
| **TC10** | Add Task - Invalid Status | `POST /api/tasks` | Status không hợp lệ (`INVALID`) | **400 Bad Request** | Báo lỗi giá trị trạng thái không hợp lệ |
| **TC11** | Update Task - Success | `PUT /api/tasks/{{id}}` | Cập nhật task vừa tạo | **200 OK** | Thuộc tính được cập nhật thành công |
| **TC12** | Update Task - Empty Title | `PUT /api/tasks/{{id}}` | Cập nhật `title` rỗng | **400 Bad Request** | Báo lỗi tiêu đề không được để trống |
| **TC13** | Update Task - Not Found | `PUT /api/tasks/9999`| ID không tồn tại | **404 Not Found** | Báo lỗi không tìm thấy task |
| **TC14** | Delete Task - Success | `DELETE /api/tasks/{{id}}` | Xóa task vừa tạo | **200 OK** | Báo đã xóa thành công |
| **TC15** | Delete Task - Not Found | `DELETE /api/tasks/{{id}}` | Xóa lại task đã bị xóa trước đó | **404 Not Found** | Báo lỗi không tìm thấy task |

---

## 6. Hướng dẫn trải nghiệm Giao diện Website (Web Demo)

1. Khởi động server:
   ```bash
   npm start
   ```
2. Mở trình duyệt web bất kỳ và truy cập địa chỉ:
   ```text
   http://localhost:3000
   ```
3. Đăng nhập với tài khoản:
   - Tên đăng nhập: `student`
   - Mật khẩu: `password123`
4. Trải nghiệm các chức năng trực quan:
   - **Xem danh sách nhiệm vụ:** Tải dữ liệu thực từ `GET /api/tasks`.
   - **Lọc nhiệm vụ:** Lọc theo trạng thái `TODO`, `IN_PROGRESS`, `COMPLETED`.
   - **Thêm nhiệm vụ:** Bấm "Tạo nhiệm vụ", điền biểu mẫu rồi lưu (gọi `POST /api/tasks`).
   - **Chi tiết và chỉnh sửa:** Bấm tên nhiệm vụ để xem chi tiết hoặc "Sửa" để cập nhật các trường.
   - **Chuyển trạng thái:** Bấm vòng tròn trước tên nhiệm vụ: Cần làm → Đang làm → Hoàn thành → Cần làm (gọi `PUT /api/tasks/:id`).
   - **Xóa nhiệm vụ:** Bấm "Xóa" rồi xác nhận trong hộp thoại (gọi `DELETE /api/tasks/:id`).
   - **Đăng xuất:** Bấm "Đăng xuất" trong thanh điều hướng.

*Lưu ý: Toàn bộ dữ liệu được đồng bộ trực tiếp qua REST API (sử dụng fetch()), không lưu Task vào localStorage.*

---

## 7. Hướng dẫn chạy và Demo trên Postman

### Cách 1: Sử dụng giao diện Postman (GUI)
1. Mở ứng dụng **Postman**.
2. Nhấn nút **Import** (ở góc trên bên trái).
3. Chọn file `postman/Student_Task_Manager_API.postman_collection.json`.
4. (Tùy chọn) Import tiếp file `postman/Student_Task_Manager_Environment.postman_environment.json`.
5. Đảm bảo API Server đang chạy (`npm start`).
6. **Chạy từng request:**
   - Chạy request `[POST] Login - Success` đầu tiên để lấy token. Token sẽ tự động được gán vào biến môi trường `{{token}}` cho các request tiếp theo!
7. **Chạy toàn bộ tự động (Collection Runner):**
   - Click chuột phải vào Collection `Student Task Manager API - SWT301` -> chọn **Run collection**.
   - Bấm **Run Student Task Manager API - SWT301**.
   - Toàn bộ 15 test cases sẽ chạy tự động và hiển thị màu xanh lá cây (**100% Passed**).

### Cách 2: Chạy kiểm thử tự động bằng Newman (CLI)
Nếu máy đã cài `newman` (`npm install -g newman`), bạn có thể xuất báo cáo trực tiếp bằng lệnh:
```bash
npx newman run postman/Student_Task_Manager_API.postman_collection.json
```

---

## 8. Đưa dự án lên GitHub Repository riêng

Dự án hoàn toàn độc lập, đã được tạo sẵn file `.gitignore`. Để đẩy lên GitHub riêng:

```bash
git init
git add .
git commit -m "feat: initial commit for Student Task Manager API testing"
git branch -M main
git remote add origin <URL_GITHUB_REPO_CUA_BAN>
git push -u origin main
```

---
*Dự án thực hiện cho môn học SWT301 - Software Testing.*

## 9. Giao diện quản lý học tập

Frontend được đồng bộ toàn bộ màn hình đăng nhập, tổng quan, nhiệm vụ và nhiệm vụ đã hoàn thành:

- Bố cục navy/cam, tiếng Việt có dấu, giao diện sáng/tối và bố cục thích ứng điện thoại.
- Thẻ thống kê và biểu đồ tiến độ có thể bấm để lọc nhiệm vụ. Thống kê luôn tính trên toàn bộ dữ liệu, độc lập với bộ lọc danh sách.
- Tìm kiếm có hoặc không dấu theo tên, mô tả, môn học; lọc trạng thái/ưu tiên; sắp xếp theo việc cần chú ý, hạn hoàn thành, mới nhất và tên.
- Chuyển giữa danh sách và bảng nhóm theo trạng thái. Việc quá hạn, ưu tiên cao được đưa lên trước; ngày quá hạn được đánh dấu.
- Tạo, xem chi tiết, chỉnh sửa toàn bộ trường, chuyển trạng thái và xóa sau khi xác nhận. Bấm vòng tròn trạng thái để chuyển Cần làm → Đang làm → Hoàn thành → Cần làm.
- Có trạng thái tải, rỗng, lỗi kết nối và nút thử lại; thông báo sau thao tác; tự trở về đăng nhập khi phiên không hợp lệ.
- Biểu mẫu có nhãn, hỗ trợ bàn phím, đóng bằng Escape, giới hạn focus trong hộp thoại và tôn trọng tùy chọn giảm chuyển động.

Không cần build frontend hoặc cài thêm thư viện UI. Chạy `npm ci` rồi `npm start`, mở `http://localhost:3000`. Có thể đổi cổng bằng biến môi trường `PORT`.

Dữ liệu nhiệm vụ nằm trong bộ nhớ máy chủ và sẽ trở về dữ liệu mẫu khi khởi động lại server. Trình duyệt chỉ lưu tùy chọn giao diện/cách hiển thị trong localStorage; phiên đăng nhập trong sessionStorage.
