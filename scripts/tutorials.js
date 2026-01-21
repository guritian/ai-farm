/**
 * AI Farm - Tutorials Module
 * 教程分享功能
 */

import { getSupabaseClient } from './supabase-client.js';

// ==================================================
// 全局变量
// ==================================================
let allTutorials = [];
let filteredTutorials = [];
let currentTutorialId = null;

// ==================================================
// 初始化
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📚 教程模块已加载');
    setupTutorialSearch();
});

// ==================================================
// 数据加载
// ==================================================

/**
 * 加载所有教程
 */
export async function loadTutorials() {
    const supabase = getSupabaseClient();
    if (!supabase) {
        showError('Supabase 未初始化');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('tutorials')
            .select(`
                *,
                ai_tools (
                    id,
                    name,
                    image_url
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log(`✅ 成功加载 ${data.length} 个教程`);
        allTutorials = data;
        filteredTutorials = data;

        renderTutorialsList();
        updateTutorialCount();
    } catch (error) {
        console.error('❌ 加载教程失败:', error);
        showError('加载教程失败: ' + error.message);
    }
}

// 导出到全局作用域供 Tab 切换使用
window.loadTutorials = loadTutorials;

// ==================================================
// 教程列表渲染
// ==================================================

/**
 * 渲染教程列表
 */
function renderTutorialsList() {
    const grid = document.getElementById('tutorialsGrid');
    const emptyState = document.getElementById('tutorialEmptyState');

    if (filteredTutorials.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    grid.innerHTML = filteredTutorials.map(tutorial => {
        const typeLabel = getTypeLabel(tutorial.content_type);
        const typeClass = tutorial.content_type || 'markdown';
        const isExternal = typeClass !== 'markdown';
        const clickHandler = isExternal
            ? `onclick="window.open('${escapeHtml(tutorial.external_url)}', '_blank', 'noopener,noreferrer')"`
            : `onclick="showTutorialDetail('${tutorial.id}')"`;

        return `
        <div class="tutorial-card" ${clickHandler}>
            <div class="tutorial-image-container">
                ${tutorial.is_featured ? '<span class="badge-featured">★ 推荐</span>' : ''}
                <span class="content-type-badge ${typeClass}">${typeLabel}</span>
                <img src="${escapeHtml(tutorial.cover_image)}" 
                     alt="${escapeHtml(tutorial.title)}" 
                     class="tutorial-image"
                     onerror="this.src='images/placeholders/tutorial.png'">
            </div>
            <div class="tutorial-card-content">
                <h3 class="tutorial-card-title">${escapeHtml(tutorial.title)}</h3>
                ${tutorial.summary ? `<p class="tutorial-card-summary">${escapeHtml(tutorial.summary)}</p>` : ''}
                
                ${tutorial.ai_tools ? `
                    <div class="tool-badge">
                        <img src="${tutorial.ai_tools.image_url || 'images/placeholders/tool.png'}" alt="${tutorial.ai_tools.name}">
                        <span>${escapeHtml(tutorial.ai_tools.name)}</span>
                    </div>
                ` : ''}
                
                <div class="tutorial-card-meta">
                    <span class="tutorial-card-author">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        ${escapeHtml(tutorial.author)}
                    </span>
                    <span class="tutorial-card-date">${formatDate(tutorial.created_at)}</span>
                </div>
                ${tutorial.tags && tutorial.tags.length > 0 ? `
                    <div class="tutorial-card-tags">
                        ${tutorial.tags.slice(0, 3).map(tag =>
            `<span class="tag">${escapeHtml(tag)}</span>`
        ).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    }).join('');
}

/**
 * 更新教程数量
 */
function updateTutorialCount() {
    const countEl = document.getElementById('tutorialResultsCount');
    if (countEl) {
        countEl.textContent = `共找到 ${filteredTutorials.length} 个教程`;
    }
}

// ==================================================
// 教程详情页
// ==================================================

/**
 * 显示教程详情
 */
async function showTutorialDetail(tutorialId) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
        const { data, error } = await supabase
            .from('tutorials')
            .select(`
                *,
                ai_tools (
                    id,
                    name,
                    image_url
                )
            `)
            .eq('id', tutorialId)
            .single();

        if (error) throw error;

        currentTutorialId = tutorialId;

        // 如果是外部链接或视频，直接打开
        if (data.content_type === 'url' || data.content_type === 'video') {
            window.open(data.external_url, '_blank', 'noopener,noreferrer');
            return;
        }

        // Markdown类型：显示详情页
        document.getElementById('tutorialsListView').style.display = 'none';
        document.getElementById('tutorialDetailView').style.display = 'block';

        // 填充详情内容
        document.getElementById('tutorialDetailTitle').textContent = data.title;
        document.getElementById('tutorialDetailAuthor').textContent = data.author;
        document.getElementById('tutorialDetailDate').textContent = formatDate(data.created_at);

        // 渲染 Markdown 内容
        const contentEl = document.getElementById('tutorialDetailContent');

        // 检查 content_md 是否存在
        if (!data.content_md) {
            contentEl.innerHTML = '<p class="error-message">教程内容为空</p>';
            console.warn('⚠️ 教程内容为空:', data.id);
        } else if (typeof marked !== 'undefined') {
            // 配置 marked.js
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
                mangle: false,
                sanitize: false // 使用 DOMPurify 进行 sanitize 会更安全，但这里先不用
            });

            contentEl.innerHTML = marked.parse(data.content_md);
        } else {
            contentEl.textContent = data.content_md;
            console.warn('⚠️ marked.js 未加载，无法渲染 Markdown');
        }

        // 滚动到顶部
        window.scrollTo(0, 0);

        // 更新浏览次数（可选）
        incrementViewCount(tutorialId);

    } catch (error) {
        console.error('❌ 加载教程详情失败:', error);
        showError('加载教程详情失败: ' + error.message);
    }
}

// 导出到全局作用域
window.showTutorialDetail = showTutorialDetail;

/**
 * 返回教程列表
 */
function backToTutorialsList() {
    document.getElementById('tutorialDetailView').style.display = 'none';
    document.getElementById('tutorialsListView').style.display = 'block';
    currentTutorialId = null;
    window.scrollTo(0, 0);
}

// 导出到全局作用域
window.backToTutorialsList = backToTutorialsList;

/**
 * 增加浏览次数
 */
async function incrementViewCount(tutorialId) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
        // 使用 RPC 或者直接 UPDATE
        await supabase.rpc('increment_tutorial_views', { tutorial_id: tutorialId })
            .catch(() => {
                // 如果 RPC 不存在，使用普通 UPDATE（需要先获取当前值）
                return supabase
                    .from('tutorials')
                    .select('view_count')
                    .eq('id', tutorialId)
                    .single()
                    .then(({ data }) => {
                        return supabase
                            .from('tutorials')
                            .update({ view_count: (data.view_count || 0) + 1 })
                            .eq('id', tutorialId);
                    });
            });
    } catch (error) {
        console.warn('⚠️ 更新浏览次数失败:', error);
    }
}

// ==================================================
// 搜索和筛选
// ==================================================

/**
 * 设置搜索监听
 */
function setupTutorialSearch() {
    const searchInput = document.getElementById('tutorialSearchInput');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim().toLowerCase();
            applyTutorialFilters(query);
        }, 300);
    });
}

/**
 * 应用筛选
 */
function applyTutorialFilters(searchQuery = '') {
    if (!searchQuery) {
        filteredTutorials = allTutorials;
    } else {
        filteredTutorials = allTutorials.filter(tutorial => {
            const matchTitle = tutorial.title.toLowerCase().includes(searchQuery);
            const matchSummary = tutorial.summary && tutorial.summary.toLowerCase().includes(searchQuery);
            const matchAuthor = tutorial.author.toLowerCase().includes(searchQuery);
            return matchTitle || matchSummary || matchAuthor;
        });
    }

    renderTutorialsList();
    updateTutorialCount();
}

// ==================================================
// 工具函数
// ==================================================

/**
 * HTML 转义
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 获取内容类型标签
 */
function getTypeLabel(type) {
    const labels = {
        'markdown': '📄 MD',
        'url': '🔗 链接',
        'video': '▶️ 视频'
    };
    return labels[type] || labels['markdown'];
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
 * 显示错误
 */
function showError(message) {
    const grid = document.getElementById('tutorialsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>加载失败</h3>
                <p>${escapeHtml(message)}</p>
                <button class="btn-primary" onclick="loadTutorials()">重试</button>
            </div>
        `;
    }
}
