# API 使用说明

## 支持的请求类型

### 1. 文字生成（text）- 原有功能，向后兼容
**请求格式：JSON**
```javascript
// POST /api/mvp-generate
{
  "type": "text",
  "content": "一个美丽的日落"
}
```

### 2. 多图片生成（multiImage）- 新功能
**请求格式：FormData**
```javascript
const formData = new FormData();
formData.append('type', 'multiImage');
formData.append('content', '基于这些图片生成复古拍立得风格'); // 可选
formData.append('images', file1); // 图片文件
formData.append('images', file2); // 可多张
```

## 验证规则

### 文字生成（text）
- 必须提供`content`（文字描述）
- 文字长度：1-500字符

### 多图片生成（multiImage）
- 图片数量：1-5张
- 支持格式：jpeg, jpg, png, webp
- 文件大小：每张最大10MB
- 文字描述：可选，如提供则最大500字符

## 返回格式

### 成功响应
```json
{
  "success": true,
  "data": {
    "id": "mvp-1695123456789",
    "outputImageUrl": "https://...",
    "processingTime": 3000,
    "detectedStyle": "portrait",
    "inputImageCount": 3  // 仅多图片时返回
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "message": "错误描述"
  }
}
```

## 前端使用示例

### 文字生成
```javascript
const response = await fetch('/api/mvp-generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'text',
    content: '一个美丽的日落'
  })
});
```

### 多图片生成
```javascript
const formData = new FormData();
formData.append('type', 'multiImage');
formData.append('content', '基于这些图片生成复古拍立得风格');
formData.append('images', fileInput.files[0]);
formData.append('images', fileInput.files[1]);

const response = await fetch('/api/mvp-generate', {
  method: 'POST',
  body: formData
});
```