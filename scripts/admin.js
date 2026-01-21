/**
 * AI Farm - Admin Panel JavaScript
 * 本地内容管理工具
 * 
 * ⚠️ 重要配置说明 ⚠️
 * 请在下方配置您的 Supabase Service Key
 * Service Key 可以在 Supabase 项目设置 > API 中找到
 */

// ==================================================
// 配置区域 - 请在此处填写您的 Supabase Service Key
// ==================================================
const SUPABASE_CONFIG = {
    url: 'https://lczgabazrjlkhmthlvhi.supabase.co',
    // ⚠️ 请替换为您的 Service Key（注意：这是 Service Role Key，不是 Anon Key）
    // 示例格式：'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjemdhYmF6cmpsa2htdGhsdmhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MjA3NSwiZXhwIjoyMDgxOTU4MDc1fQ.JxlVCmgFVNGIHUVKBVVHZdaO3vV2ykVw-Fz_tvKYB9k'
};

// ==================================================
// 全局变量
// ==================================================
let supabaseAdmin = null;
let allTools = [];
let filteredTools = [];
let currentEditingToolId = null;
let currentDeletingToolId = null;

// ==================================================
// 初始化
// ==================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 管理后台启动');

    // 检查配置
    if (SUPABASE_CONFIG.serviceKey === 'YOUR_SERVICE_KEY_HERE') {
        showConfigWarning();
        return;
    }

    // 初始化 Supabase 客户端（使用 Service Key）
    initSupabaseAdmin();

    // 测试连接
    await testConnection();

    // 加载工具数据
    await loadTools();

    // 设置搜索监听
    setupSearchListener();
});

/**
 * 显示配置警告
 */
function showConfigWarning() {
    document.getElementById('configWarning').style.display = 'block';
    document.getElementById('connectionStatus').textContent = '⚠️ 未配置';
    document.getElementById('connectionStatus').classList.add('error');
    document.getElementById('addToolBtn').disabled = true;
}

/**
 * 初始化 Supabase Admin 客户端
 */
function initSupabaseAdmin() {
    try {
        supabaseAdmin = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.serviceKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
        // 暴露到全局，供其他脚本使用
        window.supabaseAdmin = supabaseAdmin;
        console.log('✅ Supabase Admin 客户端已初始化');
    } catch (error) {
        console.error('❌ Supabase Admin 初始化失败:', error);
        showToast('初始化失败: ' + error.message, 'error');
    }
}

/**
 * 测试 Supabase 连接
 */
async function testConnection() {
    const statusEl = document.getElementById('connectionStatus');

    if (!supabaseAdmin) {
        statusEl.textContent = '❌ 连接失败';
        statusEl.classList.add('error');
        return;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('ai_tools')
            .select('count')
            .limit(1);

        if (error) throw error;

        statusEl.textContent = '✅ 已连接';
        statusEl.classList.add('connected');
        console.log('✅ Supabase 连接成功');
    } catch (error) {
        console.error('❌ 连接测试失败:', error);
        statusEl.textContent = '❌ 连接失败';
        statusEl.classList.add('error');
        showToast('数据库连接失败: ' + error.message, 'error');
    }
}

// ==================================================
// 数据加载
// ==================================================

/**
 * 加载所有工具
 */
async function loadTools() {
    if (!supabaseAdmin) {
        showToast('Supabase 未初始化', 'error');
        return;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('ai_tools')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log(`✅ 成功加载 ${data.length} 个工具`);
        allTools = data;
        filteredTools = data;

        renderToolsTable();
    } catch (error) {
        console.error('❌ 加载工具失败:', error);
        showToast('加载工具失败: ' + error.message, 'error');
        showEmptyState();
    }
}

/**
 * 渲染工具表格
 */
function renderToolsTable() {
    const tbody = document.getElementById('toolsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (filteredTools.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    tbody.innerHTML = filteredTools.map(tool => `
        <tr>
            <td><div class="tool-name">${escapeHtml(tool.name)}</div></td>
            <td><div class="tool-description">${escapeHtml(tool.description)}</div></td>
            <td>
                <div class="tool-tags-cell">
                    ${tool.tags ? tool.tags.slice(0, 3).map(tag =>
        `<span class="tag-badge">${escapeHtml(tag)}</span>`
    ).join('') : ''}
                </div>
            </td>
            <td>${escapeHtml(tool.pricing || '-')}</td>
            <td>
                ${tool.is_featured ? '<span class="badge-featured">★ 推荐</span>' : '-'}
            </td>
            <td><span class="tool-date">${formatDate(tool.created_at)}</span></td>
            <td>
                <div class="tool-actions">
                    <button class="btn-icon" onclick="openEditToolForm('${tool.id}')" title="编辑">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon danger" onclick="openDeleteModal('${tool.id}')" title="删除">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 显示空状态
 */
function showEmptyState() {
    const tbody = document.getElementById('toolsTableBody');
    tbody.innerHTML = '';
    document.getElementById('emptyState').style.display = 'block';
}

// ==================================================
// 搜索和筛选
// ==================================================

/**
 * 设置搜索监听
 */
function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim().toLowerCase();
            applyFilters(query);
        }, 300);
    });
}

/**
 * 应用筛选
 */
function applyFilters(searchQuery = '') {
    if (!searchQuery) {
        filteredTools = allTools;
    } else {
        filteredTools = allTools.filter(tool => {
            const matchName = tool.name.toLowerCase().includes(searchQuery);
            const matchDesc = tool.description.toLowerCase().includes(searchQuery);
            return matchName || matchDesc;
        });
    }

    renderToolsTable();
}

/**
 * 清除筛选
 */
window.clearFilters = function () {
    document.getElementById('searchInput').value = '';
    filteredTools = allTools;
    renderToolsTable();
};

// ==================================================
// 添加工具
// ==================================================

/**
 * 打开添加工具表单
 */
window.openAddToolForm = function () {
    currentEditingToolId = null;
    document.getElementById('modalTitle').textContent = '添加工具';
    document.getElementById('toolForm').reset();
    document.getElementById('toolId').value = '';
    document.getElementById('toolModal').style.display = 'flex';
};

/**
 * 打开编辑工具表单
 */
window.openEditToolForm = function (toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    currentEditingToolId = toolId;
    document.getElementById('modalTitle').textContent = '编辑工具';
    document.getElementById('toolId').value = toolId;

    // 填充表单
    document.getElementById('toolName').value = tool.name;
    document.getElementById('toolUrl').value = tool.url;
    document.getElementById('toolDescription').value = tool.description;
    document.getElementById('toolImageUrl').value = tool.image_url || '';
    document.getElementById('toolPricing').value = tool.pricing || '';
    document.getElementById('toolTags').value = tool.tags ? tool.tags.join(', ') : '';
    document.getElementById('toolFeatures').value = tool.features ? tool.features.join('\n') : '';
    document.getElementById('toolIsFeatured').checked = tool.is_featured || false;

    document.getElementById('toolModal').style.display = 'flex';
};

/**
 * 关闭工具表单
 */
window.closeToolModal = function () {
    document.getElementById('toolModal').style.display = 'none';
    currentEditingToolId = null;
};

/**
 * 处理表单提交
 */
window.handleToolSubmit = async function (event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoading = document.getElementById('submitLoading');

    // 禁用按钮
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'flex';

    try {
        // 收集表单数据
        const formData = {
            name: document.getElementById('toolName').value.trim(),
            url: document.getElementById('toolUrl').value.trim(),
            description: document.getElementById('toolDescription').value.trim(),
            image_url: document.getElementById('toolImageUrl').value.trim() || null,
            pricing: document.getElementById('toolPricing').value.trim() || null,
            tags: parseTagsInput(document.getElementById('toolTags').value),
            features: parseFeaturesInput(document.getElementById('toolFeatures').value),
            is_featured: document.getElementById('toolIsFeatured').checked
        };

        const toolId = document.getElementById('toolId').value;

        if (toolId) {
            // 更新现有工具
            await updateTool(toolId, formData);
        } else {
            // 创建新工具
            await createTool(formData);
        }
    } catch (error) {
        console.error('❌ 提交失败:', error);
        showToast('操作失败: ' + error.message, 'error');
    } finally {
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoading.style.display = 'none';
    }
};

/**
 * 创建新工具
 */
async function createTool(toolData) {
    const { data, error } = await supabaseAdmin
        .from('ai_tools')
        .insert([toolData])
        .select();

    if (error) throw error;

    console.log('✅ 工具创建成功:', data[0]);
    showToast('工具添加成功！', 'success');
    closeToolModal();
    await loadTools();
}

/**
 * 更新工具
 */
async function updateTool(toolId, toolData) {
    const { data, error } = await supabaseAdmin
        .from('ai_tools')
        .update(toolData)
        .eq('id', toolId)
        .select();

    if (error) throw error;

    console.log('✅ 工具更新成功:', data[0]);
    showToast('工具更新成功！', 'success');
    closeToolModal();
    await loadTools();
}

// ==================================================
// 删除工具
// ==================================================

/**
 * 打开删除确认对话框
 */
window.openDeleteModal = function (toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    currentDeletingToolId = toolId;
    document.getElementById('deleteToolName').textContent = tool.name;
    document.getElementById('deleteModal').style.display = 'flex';
};

/**
 * 关闭删除对话框
 */
window.closeDeleteModal = function () {
    document.getElementById('deleteModal').style.display = 'none';
    currentDeletingToolId = null;
};

/**
 * 确认删除
 */
window.confirmDelete = async function () {
    if (!currentDeletingToolId) return;

    const deleteBtn = document.getElementById('deleteBtn');
    const deleteText = document.getElementById('deleteText');
    const deleteLoading = document.getElementById('deleteLoading');

    // 禁用按钮
    deleteBtn.disabled = true;
    deleteText.style.display = 'none';
    deleteLoading.style.display = 'flex';

    try {
        const { error } = await supabaseAdmin
            .from('ai_tools')
            .delete()
            .eq('id', currentDeletingToolId);

        if (error) throw error;

        console.log('✅ 工具删除成功');
        showToast('工具已删除', 'success');
        closeDeleteModal();
        await loadTools();
    } catch (error) {
        console.error('❌ 删除失败:', error);
        showToast('删除失败: ' + error.message, 'error');
    } finally {
        // 恢复按钮状态
        deleteBtn.disabled = false;
        deleteText.style.display = 'inline';
        deleteLoading.style.display = 'none';
    }
};

// ==================================================
// 工具函数
// ==================================================

/**
 * 解析标签输入（逗号分隔）
 */
function parseTagsInput(input) {
    if (!input.trim()) return [];
    return input.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}

/**
 * 解析功能输入（每行一个）
 */
function parseFeaturesInput(input) {
    if (!input.trim()) return [];
    return input.split('\n').map(feature => feature.trim()).filter(feature => feature.length > 0);
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * 显示 Toast 提示
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 暴露到全局，供其他脚本使用
window.showToast = showToast;
