/**
 * AI 周报模块 - AI Farm
 * 处理周报列表展示、详情查看和视频播放
 */

// =====================================================
// 状态管理
// =====================================================
let weekreports = [];
let currentWeekreport = null;
let isInitialized = false;

// =====================================================
// 初始化
// =====================================================
async function initWeekreport() {
    if (isInitialized) {
        return;
    }

    await loadWeekreports();
    isInitialized = true;
}

// 导出给 Tab 切换调用
window.loadWeekreport = initWeekreport;

// =====================================================
// 加载周报列表
// =====================================================
async function loadWeekreports() {
    const container = document.getElementById('weekreport-list');
    const loadingEl = document.getElementById('weekreport-loading');
    const emptyEl = document.getElementById('weekreport-empty');

    if (!container) return;

    // 显示加载状态
    if (loadingEl) loadingEl.style.display = 'flex';
    if (emptyEl) emptyEl.style.display = 'none';
    container.innerHTML = '';

    try {
        const supabase = window.supabaseClient;
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase
            .from('weekreports')
            .select('*')
            .order('published_at', { ascending: false });

        if (error) throw error;

        weekreports = data || [];

        if (weekreports.length === 0) {
            if (emptyEl) emptyEl.style.display = 'flex';
        } else {
            renderWeekreportList(weekreports);
        }
    } catch (error) {
        console.error('Failed to load weekreports:', error);
        container.innerHTML = `
            <div class="weekreport-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                </svg>
                <h3>加载失败</h3>
                <p>请刷新页面重试</p>
            </div>
        `;
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

// =====================================================
// 渲染周报列表
// =====================================================
function renderWeekreportList(reports) {
    const container = document.getElementById('weekreport-list');
    if (!container) return;

    container.innerHTML = reports.map(report => createWeekreportCard(report)).join('');

    // 添加点击事件
    container.querySelectorAll('.weekreport-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            showWeekreportDetail(id);
        });
    });
}

function createWeekreportCard(report) {
    const formattedDate = formatDate(report.published_at);
    const thumbnail = getVideoThumbnail(report.video_url);
    const thumbnailStyle = thumbnail ? `background-image: url('${thumbnail}'); background-size: cover; background-position: center;` : '';

    return `
        <article class="weekreport-card" data-id="${report.id}">
            <div class="weekreport-card-thumbnail" style="${thumbnailStyle}">
                <div class="weekreport-card-play-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="weekreport-card-content">
                <h3 class="weekreport-card-title">${escapeHtml(report.title)}</h3>
                <div class="weekreport-card-date">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    ${formattedDate}
                </div>
            </div>
        </article>
    `;
}

// =====================================================
// 显示周报详情
// =====================================================
function showWeekreportDetail(id) {
    const report = weekreports.find(r => r.id === id);
    if (!report) return;

    currentWeekreport = report;

    const listView = document.getElementById('weekreport-list-view');
    const detailView = document.getElementById('weekreport-detail-view');

    if (listView) listView.style.display = 'none';
    if (detailView) {
        detailView.style.display = 'block';
        renderWeekreportDetail(report);
    }
}

function renderWeekreportDetail(report) {
    const titleEl = document.getElementById('weekreport-detail-title');
    const dateEl = document.getElementById('weekreport-detail-date');
    const videoContainer = document.getElementById('weekreport-video-container');
    const contentEl = document.getElementById('weekreport-detail-content');

    if (titleEl) titleEl.textContent = report.title;
    if (dateEl) dateEl.textContent = formatDate(report.published_at);

    // 渲染视频
    if (videoContainer) {
        const embedUrl = getVideoEmbedUrl(report.video_url);
        videoContainer.innerHTML = `
            <iframe 
                class="weekreport-video"
                src="${embedUrl}"
                allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy">
            </iframe>
        `;
    }

    // 渲染 Markdown 内容
    if (contentEl && report.content_md) {
        if (window.marked) {
            contentEl.innerHTML = marked.parse(report.content_md);
        } else {
            contentEl.innerHTML = `<pre>${escapeHtml(report.content_md)}</pre>`;
        }
    } else if (contentEl) {
        contentEl.innerHTML = '';
    }
}

// =====================================================
// 返回列表
// =====================================================
function backToWeekreportList() {
    const listView = document.getElementById('weekreport-list-view');
    const detailView = document.getElementById('weekreport-detail-view');

    if (listView) listView.style.display = 'block';
    if (detailView) detailView.style.display = 'none';

    currentWeekreport = null;
}

// 导出给 HTML 调用
window.backToWeekreportList = backToWeekreportList;

// =====================================================
// 工具函数
// =====================================================

/**
 * 转换视频链接为嵌入格式
 */
function getVideoEmbedUrl(url) {
    if (!url) return '';

    // 已经是嵌入格式
    if (url.includes('/embed/') || url.includes('player.bilibili.com')) {
        return url;
    }

    // YouTube 常规链接转嵌入
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Bilibili 常规链接转嵌入
    const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
    if (bilibiliMatch) {
        return `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}&high_quality=1`;
    }

    // 返回原始链接
    return url;
}

/**
 * 获取视频封面图
 * YouTube: 使用 img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg
 * Bilibili: 暂不支持自动获取，使用渐变占位
 */
function getVideoThumbnail(url) {
    if (!url) return null;

    // YouTube 嵌入链接
    let youtubeMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }

    // YouTube 常规链接
    youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }

    // Bilibili - 无法直接获取封面，返回 null 使用默认渐变
    if (url.includes('bilibili.com') || url.includes('player.bilibili.com')) {
        return null;
    }

    return null;
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}年${month}月${day}日`;
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =====================================================
// 导出
// =====================================================
window.weekreport = {
    loadWeekreports,
    showWeekreportDetail,
    backToWeekreportList
};
