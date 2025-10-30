# 🍳 CookBook-App

Ứng dụng quản lý công thức nấu ăn với React Native và Expo, tích hợp AI để tạo công thức tự động.

## 📱 Tính năng chính

### 🔐 Bảo mật & Xác thực

- ✅ Đăng ký tài khoản với mã hóa mật khẩu (SHA256)
- ✅ Đăng nhập an toàn
- ✅ Quên mật khẩu & đặt lại
- ✅ Đổi mật khẩu
- ✅ Validation email và mật khẩu

### 👤 Quản lý người dùng

- ✅ Chỉnh sửa thông tin cá nhân (tên, email)
- ✅ Upload avatar từ thư viện hoặc camera
- ✅ Profile page với UI hiện đại
- ✅ Đăng xuất an toàn

### 📚 Quản lý công thức

- ✅ Tạo công thức nấu ăn mới
- ✅ **Chỉnh sửa công thức** (Edit Recipe) - Sync across all collections
- ✅ **Xóa công thức với confirmation** (Delete Recipe) - Auto cleanup all references
- ✅ Xem chi tiết công thức với **auto-reload** khi có thay đổi
- ✅ Lưu công thức yêu thích
- ✅ Xem công thức đã tạo và đã lưu
- ✅ Tìm kiếm công thức
- ✅ Lọc theo danh mục
- ✅ Long-press menu trên My Recipes (Edit/Delete)
- ✅ **Real-time data synchronization** giữa các màn hình
- ✅ **Modern UI cho ingredients** - Card layout, text wrap tự động
- ✅ **🔒 Private/Public Recipe System** - Control recipe visibility

### 🤖 AI Recipe Generator

- ✅ Tạo công thức tự động từ nguyên liệu có sẵn
- ✅ Tích hợp Google Gemini AI
- ✅ Tự động tìm hình ảnh từ Pexels API
- ✅ Tùy chỉnh calories, thời gian nấu, số người ăn

### 🎨 UI/UX

- ✅ Material Design với màu sắc hiện đại
- ✅ Icons từ Ionicons
- ✅ Gradient và shadow effects
- ✅ Loading states và animations
- ✅ Responsive design

## 🚀 Cài đặt

### 1. Yêu cầu hệ thống

- Node.js >= 16.x
- npm hoặc yarn
- Expo CLI
- iOS Simulator hoặc Android Emulator (hoặc Expo Go app trên điện thoại)

### 2. Clone repository

```bash
git clone <repository-url>
cd CookBook-App
```

### 3. Cài đặt dependencies

```bash
npm install
```

### 4. Cấu hình API Keys

**QUAN TRỌNG:** Bạn cần cấu hình các API keys để ứng dụng hoạt động đầy đủ.

Tạo file `.env` trong thư mục gốc của project (file này đã có sẵn template):

```env
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
PEXELS_API_KEY=your_pexels_api_key_here

# API Configuration
API_URL=https://cookbook-app.loca.lt

# App Configuration
APP_NAME=CookBook-App
APP_VERSION=1.0.0

# Security
ENCRYPTION_KEY=cookbook-app-secret-key-2024
```

**Cách lấy API Keys:**

1. **Gemini API Key** (cho AI Recipe Generator):

   - Truy cập: https://makersuite.google.com/app/apikey
   - Đăng nhập với Google account
   - Tạo API key mới
   - Copy và paste vào `.env`

2. **Pexels API Key** (cho hình ảnh công thức):

   - Truy cập: https://www.pexels.com/api/
   - Đăng ký tài khoản miễn phí
   - Lấy API key
   - Copy và paste vào `.env`

**Lưu ý:** `API_URL` đã được cấu hình sẵn với localtunnel (`https://cookbook-app.loca.lt`). Nếu bạn muốn sử dụng local network, có thể thay đổi trong file `.env`.

### 5. Chạy JSON Server (Database)

Mở terminal mới và chạy:

```bash
npm run dev
```

Lệnh này sẽ:

- Chạy JSON server tại `http://localhost:9999`
- Tự động tạo tunnel public qua localtunnel: `https://cookbook-app.loca.lt`

**Lưu ý:** Khi truy cập localtunnel lần đầu, bạn cần click "Click to Continue" để xác thực.

### 6. Chạy ứng dụng

Mở terminal khác và chạy:

```bash
npm start
```

Sau đó:

- Nhấn `i` để mở iOS Simulator
- Nhấn `a` để mở Android Emulator
- Quét QR code với Expo Go app trên điện thoại

## 🔒 Private/Public Recipe System

Hệ thống quản lý quyền riêng tư cho recipes, cho phép user kiểm soát recipe nào được public.

### How it works:

**📝 Khi tạo recipe:**

- AI-generated recipes → Tự động **PRIVATE**
- Manually created recipes → Tự động **PRIVATE**
- Chỉ user tạo recipe mới thấy được

**🌟 Publish workflow:**

```
Create Recipe (Private)
  → Review & Edit (optional)
  → Click "Xuất bản công thức" button
  → Recipe becomes PUBLIC
  → Everyone can see it on HomePage
```

**🎨 Visual Indicators:**

- 🔒 **Private Badge** (Red) - Chỉ user thấy
- ✏️ **Edit Badge** (Blue) - My Recipe
- Recipe không có badge = Public recipe

**✨ Benefits:**

- ✅ Quality control - Review trước khi publish
- ✅ Privacy - Recipe thử nghiệm không public
- ✅ User control - Quyết định recipe nào xứng đáng share
- ✅ Clean community - Chỉ recipe chất lượng được public

### Publish Process:

1. **Create/Generate Recipe** → Saved as PRIVATE in `myRecipes`
2. **Review** → User có thể edit, test recipe
3. **Ready to share?** → Click "🌟 Xuất bản công thức" button
4. **Published!** → Recipe added to `recipes` collection
5. **Visible to everyone** → Appears on HomePage

**Note:** Sau khi publish, recipe vẫn có thể edit/delete. Mọi thay đổi sẽ sync across all collections.

## 🔄 Data Synchronization

Hệ thống tự động đồng bộ dữ liệu giữa các màn hình và collections:

### Auto-Reload Mechanism

- Sử dụng `useFocusEffect` để reload data khi màn hình được focus
- `RecipeDetail` tự động fetch recipe mới nhất từ API
- `HomePage` và `CookbookPage` tự động refresh khi quay lại

### Multi-Collection Sync

Khi edit/delete recipe, hệ thống tự động cập nhật/xóa khỏi tất cả collections:

- ✅ `myRecipes` - Công thức do user tạo
- ✅ `recipes` - Tổng hợp tất cả công thức (bao gồm AI-generated)
- ✅ `savedRecipes` - Công thức đã lưu

### Smart Data Flow

```
Edit Recipe:
  → Update myRecipes
  → Check & Update recipes (nếu tồn tại)
  → Check & Update savedRecipes (nếu tồn tại)

Delete Recipe:
  → Remove from myRecipes
  → Remove from recipes (nếu tồn tại)
  → Remove from savedRecipes (nếu tồn tại)

View Recipe:
  → Fetch from myRecipes first
  → Then recipes
  → Then savedRecipes
```

**Lợi ích:**

- 📌 Không có data inconsistency
- 🔄 Luôn hiển thị data mới nhất
- ✨ UX mượt mà, không cần reload thủ công
- 🚀 Auto-refresh khi quay lại màn hình

## 📁 Cấu trúc thư mục

```
CookBook-App/
├── pages/                      # Các màn hình
│   ├── Start.js               # Màn hình khởi động
│   ├── Login.js               # Đăng nhập (có mã hóa)
│   ├── Signup.js              # Đăng ký (có mã hóa)
│   ├── ForgotPassword.js      # Quên mật khẩu
│   ├── EditProfile.js         # Chỉnh sửa profile
│   ├── ChangePassword.js      # Đổi mật khẩu
│   ├── ProfilePage.js         # Trang profile
│   ├── HomePage.js            # Trang chủ
│   ├── ExplorePage.js         # Khám phá
│   ├── CookbookPage.js        # Công thức đã lưu
│   ├── RecipeDetail.js        # Chi tiết công thức
│   ├── RecipeByCategory.js    # Lọc theo danh mục
│   ├── CreateRecipe.js        # Tạo công thức mới
│   └── AIRecipeGenerator.js   # Tạo công thức bằng AI
├── navigation/                 # Navigation
│   └── MainTabNavigator.js    # Bottom tab navigator
├── services/                   # Services
│   ├── api.js                 # API configuration
│   ├── geminiService.js       # Gemini AI service
│   └── pexelsService.js       # Pexels image service
├── utils/                      # Utilities
│   └── encryption.js          # Mã hóa & validation
├── assets/                     # Hình ảnh, icons
├── App.js                      # Main app component
├── database.json              # JSON database
├── .env                       # Environment variables
├── package.json               # Dependencies
└── README.md                  # Tài liệu này
```

## 🔒 Bảo mật

### Mã hóa mật khẩu

- Tất cả mật khẩu được mã hóa bằng SHA256 trước khi lưu
- Không lưu trữ mật khẩu dạng plain text
- Hỗ trợ backward compatibility với tài khoản cũ

### Validation

- Email: Kiểm tra format hợp lệ
- Mật khẩu: Tối thiểu 6 ký tự, phải có chữ và số
- Tên: Tối thiểu 2 ký tự

### API Keys

- Lưu trữ trong file `.env` (đã được gitignore)
- Không commit API keys lên repository
- Sử dụng environment variables

## 🎯 Sử dụng

### Đăng ký tài khoản mới

1. Mở app và chọn "Đăng ký"
2. Nhập họ tên, email, mật khẩu
3. Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số
4. Nhấn "Đăng ký"

### Đăng nhập

1. Nhập email và mật khẩu
2. Nhấn "Đăng nhập"
3. Hoặc chọn "Quên mật khẩu?" nếu cần reset

### Chỉnh sửa profile

1. Vào tab "Profile"
2. Nhấn vào avatar hoặc chọn "Chỉnh sửa hồ sơ"
3. Upload ảnh đại diện từ thư viện hoặc camera
4. Cập nhật tên, email
5. Lưu thay đổi

### Đổi mật khẩu

1. Vào "Profile" > "Đổi mật khẩu"
2. Nhập mật khẩu hiện tại
3. Nhập mật khẩu mới
4. Xác nhận mật khẩu mới
5. Lưu

### Tạo công thức bằng AI

1. Vào tab "Home" > Nhấn nút AI
2. Nhập nguyên liệu có sẵn (cách nhau bởi dấu phẩy)
3. Chọn loại món, số người, calories, thời gian
4. Nhấn "Tạo công thức"
5. Đợi AI generate (khoảng 5-10 giây)
6. Lưu công thức nếu thích

### Chỉnh sửa công thức

**Cách 1: Từ RecipeDetail**

1. Mở công thức của bạn (My Recipe)
2. Nhấn nút "Edit" (icon bút) ở góc trên bên phải
3. Chỉnh sửa thông tin
4. Nhấn "Cập nhật công thức"

**Cách 2: Từ Cookbook**

1. Vào tab "Cookbook" > "My Recipe"
2. Long press (giữ lâu) vào công thức
3. Chọn "Chỉnh sửa"
4. Cập nhật và lưu

### Xóa công thức

**Cách 1: Từ RecipeDetail**

1. Mở công thức của bạn
2. Nhấn nút "Delete" (icon thùng rác) màu đỏ
3. Xác nhận xóa

**Cách 2: Từ Cookbook**

1. Vào "Cookbook" > "My Recipe"
2. Long press vào công thức
3. Chọn "Xóa"
4. Xác nhận

## 🛠️ Scripts

```bash
# Chạy app
npm start

# Chạy JSON server
npm run server

# Chạy cả app và server (song song)
npm run dev

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios
```

## 📦 Dependencies chính

- `react-native`: Framework
- `expo`: Development platform
- `@react-navigation`: Navigation
- `crypto-js`: Mã hóa mật khẩu
- `@google/genai`: Google Gemini AI
- `expo-image-picker`: Upload hình ảnh
- `@react-native-async-storage`: Local storage
- `react-native-vector-icons`: Icons
- `json-server`: Mock database

## 🐛 Troubleshooting

### JSON Server không kết nối được

- Kiểm tra xem JSON server có đang chạy không: `npm run server`
- Kiểm tra localtunnel có đang hoạt động không: truy cập https://cookbook-app.loca.lt
- Nếu cần, chạy lại localtunnel: `npm run lt`
- Đảm bảo `API_URL` trong `.env` khớp với URL localtunnel của bạn

### AI Recipe Generator không hoạt động

- Kiểm tra `GEMINI_API_KEY` trong `.env` có đúng không
- Kiểm tra kết nối internet
- Kiểm tra console log để xem error message

### Hình ảnh không load

- Kiểm tra `PEXELS_API_KEY` trong `.env`
- Kiểm tra kết nối internet

### App crash khi upload ảnh

- Cấp quyền truy cập camera/thư viện cho app
- Kiểm tra thiết bị có đủ dung lượng không

## 📝 TODO

- [x] **Thêm chức năng edit/delete recipe** ✅
- [x] **Private/Public Recipe System** ✅
- [ ] Thêm rating & reviews
- [ ] Shopping list từ ingredients
- [ ] Meal planning
- [ ] Dark mode
- [ ] Offline mode
- [ ] Push notifications
- [ ] Export recipe to PDF
- [ ] Share recipe via social media
- [ ] User profile page với published recipes count
- [ ] Trending/Popular recipes section

## 👨‍💻 Phát triển

```bash
# Clear cache
npx expo start -c

# Reset metro bundler
npx react-native start --reset-cache
```

## 📄 License

MIT License

## 🤝 Đóng góp

Contributions, issues và feature requests đều được welcome!

---

Made with ❤️ using React Native & Expo
