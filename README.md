# CookBook-App

Ứng dụng quản lý công thức nấu ăn với React Native và Expo.

## Cài đặt

1. Cài đặt dependencies:

```bash
npm install
```

2. Cấu hình file môi trường:

   - Sao chép file `.env.example` thành `.env`:

   ```bash
   copy .env.example .env  # Windows
   cp .env.example .env    # Mac/Linux
   ```

   - Mở file `.env` và cập nhật `API_URL` với IP address của máy tính bạn:

   ```
   API_URL=http://YOUR_IP_ADDRESS:5001
   ```

   - Để kiểm tra IP address của bạn:
     - Windows: `ipconfig` (tìm IPv4 Address trong phần Wi-Fi)
     - Mac/Linux: `ifconfig` hoặc `ip addr`

3. Khởi động JSON Server:

```bash
npm run server
```

4. Trong terminal khác, khởi động ứng dụng:

```bash
npm start
```

## Lưu ý

- File `.env` chứa thông tin cấu hình cá nhân và không được commit lên Git
- Nếu IP address của bạn thay đổi (ví dụ khi đổi mạng WiFi), hãy cập nhật lại file `.env`
- JSON Server phải chạy trên cổng 5001 để ứng dụng hoạt động đúng
