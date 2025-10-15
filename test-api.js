// 简单的API测试脚本
const fs = require('fs');
const path = require('path');

// 测试文字生成（原有功能）
async function testTextGeneration() {
  console.log('测试文字生成功能...');

  const response = await fetch('http://localhost:3000/api/mvp-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'text',
      content: '一个美丽的日落'
    })
  });

  const result = await response.json();
  console.log('文字生成结果:', result);
  return result;
}

// 测试多图片上传功能
async function testMultiImageGeneration() {
  console.log('测试多图片生成功能...');

  // 创建FormData
  const formData = new FormData();
  formData.append('type', 'multiImage');
  formData.append('content', '基于这些图片生成一张复古拍立得风格的照片');

  // 这里需要真实的图片文件，暂时只测试参数验证

  const response = await fetch('http://localhost:3000/api/mvp-generate', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  console.log('多图片生成结果:', result);
  return result;
}

// 主测试函数
async function runTests() {
  try {
    // 测试JSON格式（向后兼容）
    await testTextGeneration();

    // 测试FormData格式（新功能）
    await testMultiImageGeneration();

  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('请先启动开发服务器: npm run dev');
  console.log('然后在浏览器中运行此测试或使用其他HTTP客户端');
}

module.exports = { testTextGeneration, testMultiImageGeneration };