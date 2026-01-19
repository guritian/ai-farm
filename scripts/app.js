/**
 * 主应用逻辑
 * 处理页面交互和 API 调用
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
    updateStatus('应用已准备就绪');
    checkSystemHealth();
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
 * 检查系统健康状态
 */
async function checkSystemHealth() {
    try {
        const response = await fetch('/.netlify/functions/api/health');
        const data = await response.json();

        if (response.ok) {
            console.log('✅ 系统健康检查通过:', data);
            updateStatus(`系统状态: ${data.status} | 时间: ${new Date(data.timestamp).toLocaleString('zh-CN')}`, 'success');
        } else {
            console.warn('⚠️ 健康检查失败:', data);
            updateStatus('后端 API 暂时不可用（可能是本地开发环境）', 'info');
        }
    } catch (error) {
        console.warn('⚠️ 无法连接到后端 API:', error.message);
        updateStatus('后端 API 未启动（本地开发请使用 netlify dev）', 'info');
    }
}

/**
 * 测试 API 连接
 */
window.testAPI = async function () {
    updateStatus('正在测试 API 连接...', 'info');

    try {
        // 测试健康检查 API
        const healthResponse = await fetch('/.netlify/functions/api/health');
        const healthData = await healthResponse.json();

        // 测试示例 API
        const exampleResponse = await fetch('/.netlify/functions/api/example');
        const exampleData = await exampleResponse.json();

        console.log('✅ API 测试结果:');
        console.log('健康检查:', healthData);
        console.log('示例 API:', exampleData);

        updateStatus(
            `✅ API 连接成功！健康状态: ${healthData.status} | 示例数据: ${JSON.stringify(exampleData)}`,
            'success'
        );
    } catch (error) {
        console.error('❌ API 测试失败:', error);
        updateStatus(
            `❌ API 连接失败: ${error.message}。请确保使用 'netlify dev' 启动本地服务器。`,
            'error'
        );
    }
};

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
                `⚠️ ${result.message}。请检查 .env 文件中的 Supabase 配置。`,
                'error'
            );
        }
    } catch (error) {
        console.error('❌ Supabase 测试异常:', error);
        updateStatus(`❌ 测试异常: ${error.message}`, 'error');
    }
};

// 导出函数供其他模块使用
export { updateStatus, checkSystemHealth };
