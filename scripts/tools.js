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
    const imageUrl = tool.image_url || 'images/placeholders/tool.png';
    const tags = tool.tags ? tool.tags.slice(0, 4) : [];

    return `
        <div class="tool-card" onclick="showToolDetails('${tool.id}')">
            <div class="tool-image-container">
                ${featuredBadge}
                <img src="${imageUrl}" alt="${tool.name}" class="tool-image" onerror="this.src='images/placeholders/tool.png'">
            </div>
            <div class="tool-content">
                <div class="tool-header">
                    <h3 class="tool-name">${tool.name}</h3>
                    <p class="tool-description">${truncate(tool.description, 100)}</p>
                </div>
                <div class="tool-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="tool-footer">
                    <span class="tool-pricing">${tool.pricing || '价格未知'}</span>
                    <a href="${tool.url}" target="_blank" rel="noopener" class="tool-link" onclick="event.stopPropagation()">
                        访问 →
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * 显示工具详情页面
 */
window.showToolDetails = function (toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    // Hide main content, show detail page
    document.querySelector('.main').style.display = 'none';
    const detailPage = document.getElementById('toolDetailPage');
    detailPage.style.display = 'block';
    window.scrollTo(0, 0);

    // Populate header
    document.getElementById('detailLogo').src = tool.image_url || 'images/placeholders/tool.png';
    document.getElementById('detailLogo').alt = tool.name;
    document.getElementById('detailTitle').textContent = tool.name;
    document.getElementById('detailTagline').textContent = tool.description;
    document.getElementById('detailCTA').href = tool.url;

    // Populate gallery
    renderGallery(tool);

    // Populate features
    renderFeatures(tool);

    // Populate tutorials
    renderTutorials(tool);

    // Populate pros & cons
    renderProsAndCons(tool);

    // Populate sidebar specs
    renderSpecs(tool);

    // Populate quick links
    renderQuickLinks(tool);

    // Populate alternatives
    renderAlternatives(tool);
};

/**
 * 隐藏详情页面，返回工具列表
 */
window.hideDetailPage = function () {
    document.getElementById('toolDetailPage').style.display = 'none';
    document.querySelector('.main').style.display = 'block';
    window.scrollTo(0, 0);
};

/**
 * 渲染图库
 */
function renderGallery(tool) {
    const galleryEl = document.getElementById('detailGallery');

    // Use screenshots if available, otherwise show main image
    const screenshots = tool.screenshots || [tool.image_url];

    if (!screenshots || screenshots.length === 0) {
        galleryEl.innerHTML = '<p style="color: var(--color-text-secondary);">暂无图片</p>';
        return;
    }

    galleryEl.innerHTML = screenshots.map(url => `
        <img src="${url || 'images/placeholders/tutorial.png'}" 
             alt="${tool.name} screenshot" 
             class="gallery-image"
             onerror="this.src='images/placeholders/tutorial.png'">
    `).join('');
}

/**
 * 渲染功能列表
 */
function renderFeatures(tool) {
    const featuresEl = document.getElementById('detailFeatures');

    const features = tool.features || [
        '强大的 AI 能力',
        '简单易用的界面',
        '快速响应速度'
    ];

    featuresEl.innerHTML = features.map((feature, index) => `
        <li class="feature-item">
            <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="feature-content">
                <h4>功能 ${index + 1}</h4>
                <p>${feature}</p>
            </div>
        </li>
    `).join('');
}

/**
 * 渲染教程
 */
function renderTutorials(tool) {
    const tutorialsEl = document.getElementById('detailTutorials');

    // Sample tutorials - in real app, this would come from database
    const tutorials = tool.tutorials || [
        {
            title: '快速入门教程',
            platform: 'Bilibili',
            thumbnail: 'images/placeholders/tutorial.png',
            url: '#'
        },
        {
            title: '高级功能指南',
            platform: 'YouTube',
            thumbnail: 'images/placeholders/tutorial.png',
            url: '#'
        },
        {
            title: '官方文档',
            platform: 'Docs',
            thumbnail: 'images/placeholders/tutorial.png',
            url: tool.url
        }
    ];

    tutorialsEl.innerHTML = tutorials.map(tutorial => `
        <a href="${tutorial.url}" target="_blank" rel="noopener" class="tutorial-card">
            <img src="${tutorial.thumbnail}" alt="${tutorial.title}" class="tutorial-thumbnail">
            <div class="tutorial-content">
                <span class="tutorial-platform">${tutorial.platform}</span>
                <h4 class="tutorial-title">${tutorial.title}</h4>
            </div>
        </a>
    `).join('');
}

/**
 * 渲染优缺点
 */
function renderProsAndCons(tool) {
    const prosEl = document.getElementById('detailPros');
    const consEl = document.getElementById('detailCons');

    const pros = tool.pros || [
        '功能强大且全面',
        '用户界面友好',
        '响应速度快',
        '文档完善'
    ];

    const cons = tool.cons || [
        '价格相对较高',
        '学习曲线略陡',
        '某些功能需要付费'
    ];

    prosEl.innerHTML = pros.map(pro => `<li>${pro}</li>`).join('');
    consEl.innerHTML = cons.map(con => `<li>${con}</li>`).join('');
}

/**
 * 渲染关键参数
 */
function renderSpecs(tool) {
    document.getElementById('specPricing').textContent = tool.pricing || '免费/付费';
    document.getElementById('specPlatform').textContent = tool.platform || 'Web / iOS / Android';
    document.getElementById('specLanguage').textContent = tool.language || '中文 / English';
}

/**
 * 渲染快速链接
 */
function renderQuickLinks(tool) {
    const quickLinksEl = document.getElementById('quickLinks');

    const quickLinks = tool.quick_links || [
        { label: '官方 API 文档', url: tool.url + '/docs' },
        { label: '官方 Discord 社区', url: tool.url + '/community' },
        { label: 'GitHub 仓库', url: 'https://github.com' }
    ];

    quickLinksEl.innerHTML = quickLinks.map(link => `
        <li class="quick-link-item">
            <a href="${link.url}" target="_blank" rel="noopener">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${link.label}
            </a>
        </li>
    `).join('');
}

/**
 * 渲染相似工具
 */
function renderAlternatives(tool) {
    const alternativesEl = document.getElementById('detailAlternatives');

    // Find similar tools (same tags)
    const alternatives = allTools
        .filter(t => t.id !== tool.id && t.tags && tool.tags &&
            t.tags.some(tag => tool.tags.includes(tag)))
        .slice(0, 3);

    if (alternatives.length === 0) {
        alternativesEl.innerHTML = '<p style="color: var(--color-text-secondary); font-size: 0.875rem;">暂无相似工具</p>';
        return;
    }

    alternativesEl.innerHTML = alternatives.map(alt => `
        <div class="alternative-item" onclick="showToolDetails('${alt.id}')">
            <img src="${alt.image_url || 'images/placeholders/tool.png'}" 
                 alt="${alt.name}" 
                 class="alternative-icon"
                 onerror="this.src='images/placeholders/tool.png'">
            <span class="alternative-name">${alt.name}</span>
        </div>
    `).join('');
}

/**
 * 关闭模态框 (保留向后兼容)
 */
window.closeModal = function () {
    hideDetailPage();
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
