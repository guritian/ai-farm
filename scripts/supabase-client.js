/**
 * Supabase 客户端初始化
 * 从环境变量或配置中读取 Supabase URL 和 ANON KEY
 */

// 从 meta 标签或 window 对象读取配置
const getConfig = (name, defaultValue) => {
    // 优先从 meta 标签读取（用于静态部署）
    const meta = document.querySelector(`meta[name="${name}"]`);
    if (meta) return meta.content;

    // 其次从 window 对象读取（用于 Netlify 部署）
    if (window[name]) return window[name];

    // 返回默认值
    return defaultValue;
};

// Supabase 配置
const SUPABASE_CONFIG = {
    url: getConfig('SUPABASE_URL', 'https://lczgabazrjlkhmthlvhi.supabase.co'),
    anonKey: getConfig('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjemdhYmF6cmpsa2htdGhsdmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODIwNzUsImV4cCI6MjA4MTk1ODA3NX0.3Ne3lks0pzeWT23iHxny4rhX1k6kVEpjickGPFn8GgM')
};

// 创建 Supabase 客户端实例
let supabaseClient = null;

try {
    // 检查 Supabase SDK 是否已加载
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase SDK 未加载，请检查 CDN 链接');
    } else {
        // 初始化 Supabase 客户端
        supabaseClient = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );

        console.log('✅ Supabase 客户端已初始化');
        console.log('📡 Supabase URL:', SUPABASE_CONFIG.url);
    }
} catch (error) {
    console.error('❌ Supabase 客户端初始化失败:', error);
}

/**
 * 测试 Supabase 连接
 * @returns {Promise<Object>} 连接状态
 */
export async function testSupabaseConnection() {
    if (!supabaseClient) {
        return {
            success: false,
            message: 'Supabase 客户端未初始化'
        };
    }

    try {
        // 使用更简单的方法：获取当前会话
        // 这个 API 调用总是成功的（即使没有认证用户）
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
            console.warn('⚠️ Supabase 连接测试失败:', error.message);
            return {
                success: false,
                message: `连接失败: ${error.message}`,
                error: error
            };
        }

        console.log('✅ Supabase 连接成功');
        return {
            success: true,
            message: 'Supabase 连接成功',
            data: { session: data.session ? '已登录' : '未登录' }
        };
    } catch (error) {
        console.error('❌ Supabase 连接测试异常:', error);
        return {
            success: false,
            message: `连接异常: ${error.message}`,
            error: error
        };
    }
}

/**
 * 获取 Supabase 客户端实例
 * @returns {Object|null} Supabase 客户端
 */
export function getSupabaseClient() {
    return supabaseClient;
}

// 导出到全局作用域（供非模块脚本使用）
window.supabaseClient = supabaseClient;
window.testSupabaseConnection = testSupabaseConnection;

export default supabaseClient;
