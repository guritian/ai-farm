/**
 * 周报管理模块 - AI Farm Admin
 * 处理周报的增删改查
 */

import { getSupabaseClient } from './supabase-client.js';

// =====================================================
// 状态管理
// =====================================================
let weekreports = [];
let currentEditId = null;
let currentDeleteId = null;

// =====================================================
// 初始化
// =====================================================
async function initWeekreportAdmin() {
    await loadWeekreports();
}

// 导出给全局调用
window.initWeekreportAdmin = initWeekreportAdmin;

// =====================================================
// 加载周报列表
// =====================================================
async function loadWeekreports() {
    const tableBody = document.getElementById('weekreportTableBody');
    const emptyState = document.getElementById('weekreportEmptyState');

    if (!tableBody) return;

    // 显示加载状态
    tableBody.innerHTML = `
        <tr>
            <td colspan="4" class="loading-row">
                <div class="spinner"></div>
                <p>加载中...</p>
            </td>
        </tr>
    `;

    try {
        const supabase = getSupabaseClient();
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
            tableBody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            renderWeekreportTable(weekreports);
        }
    } catch (error) {
        console.error('Failed to load weekreports:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="error-row">
                    <p>加载失败: ${error.message}</p>
                    <button onclick="loadWeekreports()" class="btn-secondary">重试</button>
                </td>
            </tr>
        `;
    }
}

window.loadWeekreports = loadWeekreports;

// =====================================================
// 渲染表格
// =====================================================
function renderWeekreportTable(reports) {
    const tableBody = document.getElementById('weekreportTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = reports.map(report => `
        <tr>
            <td>
                <strong>${escapeHtml(report.title)}</strong>
            </td>
            <td>
                <a href="${escapeHtml(report.video_url)}" target="_blank" class="link-primary" style="word-break: break-all; max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${escapeHtml(report.video_url)}
                </a>
            </td>
            <td>${formatDate(report.published_at)}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="openEditWeekreportForm('${report.id}')" class="btn-icon" title="编辑">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button onclick="openDeleteWeekreportModal('${report.id}')" class="btn-icon btn-icon-danger" title="删除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// =====================================================
// 添加/编辑表单
// =====================================================
function openAddWeekreportForm() {
    currentEditId = null;
    document.getElementById('weekreportModalTitle').textContent = '添加周报';
    document.getElementById('weekreportForm').reset();
    document.getElementById('weekreportId').value = '';
    document.getElementById('weekreportVideoPreview').innerHTML = '输入视频链接后点击预览';
    document.getElementById('weekreportModal').style.display = 'flex';
}

window.openAddWeekreportForm = openAddWeekreportForm;

function openEditWeekreportForm(id) {
    const report = weekreports.find(r => r.id === id);
    if (!report) return;

    currentEditId = id;
    document.getElementById('weekreportModalTitle').textContent = '编辑周报';
    document.getElementById('weekreportId').value = id;
    document.getElementById('weekreportTitle').value = report.title || '';
    document.getElementById('weekreportVideoUrl').value = report.video_url || '';
    document.getElementById('weekreportContentMd').value = report.content_md || '';

    // 设置发布时间
    if (report.published_at) {
        const date = new Date(report.published_at);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        document.getElementById('weekreportPublishedAt').value = localDate.toISOString().slice(0, 16);
    }

    // 预览视频
    previewWeekreportVideo();

    document.getElementById('weekreportModal').style.display = 'flex';
}

window.openEditWeekreportForm = openEditWeekreportForm;

function closeWeekreportModal() {
    document.getElementById('weekreportModal').style.display = 'none';
    currentEditId = null;
}

window.closeWeekreportModal = closeWeekreportModal;

// =====================================================
// 视频预览
// =====================================================
function previewWeekreportVideo() {
    const urlInput = document.getElementById('weekreportVideoUrl');
    const previewContainer = document.getElementById('weekreportVideoPreview');

    if (!urlInput || !previewContainer) return;

    const url = urlInput.value.trim();
    if (!url) {
        previewContainer.innerHTML = '请输入视频链接';
        return;
    }

    const embedUrl = getVideoEmbedUrl(url);
    previewContainer.innerHTML = `
        <iframe 
            src="${embedUrl}" 
            style="width: 100%; height: 100%; border: none; border-radius: 8px;"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
        </iframe>
    `;
}

window.previewWeekreportVideo = previewWeekreportVideo;

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

    return url;
}

// =====================================================
// 表单提交
// =====================================================
async function handleWeekreportSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('weekreportSubmitBtn');
    const submitText = document.getElementById('weekreportSubmitText');
    const submitLoading = document.getElementById('weekreportSubmitLoading');

    // 显示加载状态
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'inline-flex';

    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const id = document.getElementById('weekreportId').value;
        const title = document.getElementById('weekreportTitle').value.trim();
        const videoUrl = document.getElementById('weekreportVideoUrl').value.trim();
        const contentMd = document.getElementById('weekreportContentMd').value.trim();
        const publishedAtInput = document.getElementById('weekreportPublishedAt').value;

        const data = {
            title,
            video_url: videoUrl,
            content_md: contentMd || null,
            published_at: publishedAtInput ? new Date(publishedAtInput).toISOString() : new Date().toISOString()
        };

        let error;
        if (id) {
            // 更新
            const result = await supabase
                .from('weekreports')
                .update(data)
                .eq('id', id);
            error = result.error;
        } else {
            // 新增
            const result = await supabase
                .from('weekreports')
                .insert(data);
            error = result.error;
        }

        if (error) throw error;

        showToast(id ? '周报已更新' : '周报已添加', 'success');
        closeWeekreportModal();
        await loadWeekreports();
    } catch (error) {
        console.error('Failed to save weekreport:', error);
        showToast('保存失败: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoading.style.display = 'none';
    }
}

window.handleWeekreportSubmit = handleWeekreportSubmit;

// =====================================================
// 删除确认
// =====================================================
function openDeleteWeekreportModal(id) {
    const report = weekreports.find(r => r.id === id);
    if (!report) return;

    currentDeleteId = id;
    document.getElementById('deleteWeekreportName').textContent = report.title;
    document.getElementById('weekreportDeleteModal').style.display = 'flex';
}

window.openDeleteWeekreportModal = openDeleteWeekreportModal;

function closeWeekreportDeleteModal() {
    document.getElementById('weekreportDeleteModal').style.display = 'none';
    currentDeleteId = null;
}

window.closeWeekreportDeleteModal = closeWeekreportDeleteModal;

async function confirmDeleteWeekreport() {
    if (!currentDeleteId) return;

    const deleteBtn = document.getElementById('weekreportDeleteBtn');
    const deleteText = document.getElementById('weekreportDeleteText');
    const deleteLoading = document.getElementById('weekreportDeleteLoading');

    // 显示加载状态
    deleteBtn.disabled = true;
    deleteText.style.display = 'none';
    deleteLoading.style.display = 'inline-flex';

    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { error } = await supabase
            .from('weekreports')
            .delete()
            .eq('id', currentDeleteId);

        if (error) throw error;

        showToast('周报已删除', 'success');
        closeWeekreportDeleteModal();
        await loadWeekreports();
    } catch (error) {
        console.error('Failed to delete weekreport:', error);
        showToast('删除失败: ' + error.message, 'error');
    } finally {
        deleteBtn.disabled = false;
        deleteText.style.display = 'inline';
        deleteLoading.style.display = 'none';
    }
}

window.confirmDeleteWeekreport = confirmDeleteWeekreport;

// =====================================================
// 工具函数
// =====================================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.log(`[${type}] ${message}`);
        return;
    }

    toast.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
