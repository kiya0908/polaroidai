/**
 * 全局 API 路由配置
 * 强制所有 API 路由为动态路由，防止构建时静态化
 *
 * 这对于依赖认证、数据库或其他运行时资源的 API 至关重要
 */

// 导出给所有 API 路由使用的默认配置
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
