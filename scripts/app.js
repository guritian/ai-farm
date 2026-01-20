/**
 * 主应用逻辑
 * 处理页面交互和 Supabase 操作
 */

import { testSupabaseConnection } from './supabase-client.js';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 AI Farm 应用已启动');

    // 初始化页面
    initializePage();
});

/**
 * 初始化页面
 */
function initializePage() {
    updateStatus('应用已准备就绪 - 前端直连 Supabase 模式');
}

/**
 * 更新状态显示
 * @param {string} message - 状态消息
 * @param {string} type - 消息类型 (info, success, error)
 */
function updateStatus(message, type = 'info') {
    const statusInfo = document.getElementById('status-info');
    if (!statusInfo) return;

    const className = type === 'success' ? 'status-success' :
        type === 'error' ? 'status-error' : '';

    statusInfo.innerHTML = `<p class="${className}">${message}</p>`;
}

/**
 * 测试 Supabase 连接
 */
window.testSupabase = async function () {
    updateStatus('正在测试 Supabase 连接...', 'info');

    try {
        const result = await testSupabaseConnection();

        if (result.success) {
            console.log('✅ Supabase 测试成功:', result);
            updateStatus(`✅ ${result.message}`, 'success');
        } else {
            console.warn('⚠️ Supabase 测试失败:', result);
            updateStatus(
                `⚠️ ${result.message}。请检查环境变量配置。`,
                'error'
            );
        }
    } catch (error) {
        console.error('❌ Supabase 测试异常:', error);
        updateStatus(`❌ 测试异常: ${error.message}`, 'error');
    }
};

// 导出函数供其他模块使用
export { updateStatus };
