/**
 * AI 工具页面逻辑
 * 处理工具加载、筛选、搜索和展示
 */

import { getSupabaseClient } from './supabase-client.js';

// 全局变量
let allTools = [];
let filteredTools = [];
let selectedTags = new Set();
let searchQuery = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 AI 工具页面已启动');

    // 加载工具数据
    await loadTools();

    // 设置搜索监听
    setupSearchListener();
});

/**
 * 从 Supabase 加载工具数据
 */
async function loadTools() {
    const supabase = getSupabaseClient();

    if (!supabase) {
        showError('Supabase 客户端未初始化');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('ai_tools')
            .select('*')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ 加载工具失败:', error);
            showError('加载工具失败: ' + error.message);
            return;
        }

        console.log(`✅ 成功加载 ${data.length} 个工具`);
        allTools = data;
        filteredTools = data;

        // 渲染页面
        renderTagFilters();
        renderTools();
        updateResultsCount();

    } catch (error) {
        console.error('❌ 加载工具异常:', error);
        showError('加载工具异常: ' + error.message);
    }
}

/**
 * 渲染标签筛选器
 */
function renderTagFilters() {
    const tagSet = new Set();

    // 收集所有唯一标签
    allTools.forEach(tool => {
        if (tool.tags && Array.isArray(tool.tags)) {
            tool.tags.forEach(tag => tagSet.add(tag));
        }
    });

    const tags = Array.from(tagSet).sort();
    const tagFiltersEl = document.getElementById('tagFilters');

    if (tags.length === 0) {
        tagFiltersEl.innerHTML = '<p class="text-muted">暂无标签</p>';
        return;
    }

    tagFiltersEl.innerHTML = tags.map(tag => `
        <button 
            class="tag-filter-btn" 
            data-tag="${tag}"
            onclick="toggleTag('${tag}')"
        >
            ${tag}
        </button>
    `).join('');
}

/**
 * 切换标签选择
 */
window.toggleTag = function (tag) {
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
    } else {
        selectedTags.add(tag);
    }

    // 更新 UI
    updateTagButtons();
    applyFilters();
};

/**
 * 更新标签按钮样式
 */
function updateTagButtons() {
    document.querySelectorAll('.tag-filter-btn').forEach(btn => {
        const tag = btn.dataset.tag;
        if (selectedTags.has(tag)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * 应用筛选和搜索
 */
function applyFilters() {
    filteredTools = allTools.filter(tool => {
        // 搜索筛选
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchName = tool.name.toLowerCase().includes(query);
            const matchDesc = tool.description.toLowerCase().includes(query);
            if (!matchName && !matchDesc) {
                return false;
            }
        }

        // 标签筛选（OR 关系）
        if (selectedTags.size > 0) {
            const hasTag = tool.tags && tool.tags.some(tag => selectedTags.has(tag));
            if (!hasTag) {
                return false;
            }
        }

        return true;
    });

    renderTools();
    updateResultsCount();
}

/**
 * 渲染工具卡片
 */
function renderTools() {
    const toolsGrid = document.getElementById('toolsGrid');
    const emptyState = document.getElementById('emptyState');

    if (filteredTools.length === 0) {
        toolsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    toolsGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    toolsGrid.innerHTML = filteredTools.map(tool => createToolCard(tool)).join('');
}

/**
 * 创建工具卡片 HTML
 */
function createToolCard(tool) {
    const featuredBadge = tool.is_featured ? '<span class="badge-featured">推荐</span>' : '';
    const imageUrl = tool.image_url || '/images/placeholder.png';
    const tags = tool.tags ? tool.tags.slice(0, 4) : [];

    return `
        <div class="tool-card" data-tool-id="${tool.id}">
            ${featuredBadge}
            <div class="tool-image-wrapper">
                <img src="${imageUrl}" alt="${tool.name}" class="tool-image" onerror="this.src='/images/placeholder.png'">
            </div>
            <div class="tool-content">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${truncate(tool.description, 100)}</p>
                <div class="tool-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="tool-footer">
                    <span class="tool-pricing">${tool.pricing || '价格未知'}</span>
                </div>
            </div>
            <div class="tool-actions">
                <button class="btn btn-secondary btn-sm" onclick="showToolDetails('${tool.id}')">详情</button>
                <a href="${tool.url}"target="_blank" rel="noopener" class="btn btn-primary btn-sm">访问</a>
            </div>
        </div>
    `;
}

/**
 * 显示工具详情
 */
window.showToolDetails = function (toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    const modal = document.getElementById('toolModal');
    const modalBody = document.getElementById('modalBody');

    const features = tool.features && tool.features.length > 0
        ? `<ul class="feature-list">
            ${tool.features.map(f => `<li>${f}</li>`).join('')}
          </ul>`
        : '<p>暂无功能列表</p>';

    const tags = tool.tags ? tool.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

    modalBody.innerHTML = `
        <div class="modal-header-content">
            <img src="${tool.image_url || '/images/placeholder.png'}" alt="${tool.name}" class="modal-image" onerror="this.src='/images/placeholder.png'">
            <div>
                <h2>${tool.name}</h2>
                <div class="modal-tags">${tags}</div>
            </div>
        </div>
        <div class="modal-section">
            <h3>简介</h3>
            <p>${tool.description}</p>
        </div>
        <div class="modal-section">
            <h3>主要功能</h3>
            ${features}
        </div>
        <div class="modal-section">
            <h3>定价信息</h3>
            <p class="pricing-info">${tool.pricing || '价格未知'}</p>
        </div>
        <div class="modal-actions">
            <a href="${tool.url}" target="_blank" rel="noopener" class="btn btn-primary btn-lg">
                访问 ${tool.name}
            </a>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

/**
 * 关闭模态框
 */
window.closeModal = function () {
    const modal = document.getElementById('toolModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

/**
 * 设置搜索监听
 */
function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchQuery = e.target.value.trim();
            applyFilters();
        }, 300);
    });
}

/**
 * 清除所有筛选
 */
window.clearFilters = function () {
    selectedTags.clear();
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    updateTagButtons();
    applyFilters();
};

/**
 * 更新结果数量显示
 */
function updateResultsCount() {
    const countEl = document.getElementById('resultsCount');
    const count = filteredTools.length;
    const total = allTools.length;

    if (selectedTags.size > 0 || searchQuery) {
        countEl.textContent = `找到 ${count} 个工具（共 ${total} 个）`;
    } else {
        countEl.textContent = `共 ${total} 个工具`;
    }
}

/**
 * 显示错误消息
 */
function showError(message) {
    const toolsGrid = document.getElementById('toolsGrid');
    toolsGrid.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>加载失败</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">重新加载</button>
        </div>
    `;
}

/**
 * 截断文本
 */
function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
