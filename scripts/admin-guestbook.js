/**
 * Admin Guestbook Module - AI Farm
 * Handles guestbook moderation, approval, featuring, and deletion
 */

// =====================================================
// State
// =====================================================
let guestbookMessages = [];
let filteredMessages = [];
let selectedMessageIds = new Set();
let searchTimeout = null;

// =====================================================
// Initialization
// =====================================================
window.initGuestbookAdmin = async function () {
    await loadGuestbookMessages();
};

// Make functions available globally for inline event handlers
window.onGuestbookSearchInput = onGuestbookSearchInput;
window.onGuestbookFilterChange = onGuestbookFilterChange;
window.clearGuestbookFilters = clearGuestbookFilters;
window.toggleGuestbookSelectAll = toggleGuestbookSelectAll;
window.batchApproveGuestbook = batchApproveGuestbook;
window.batchDeleteGuestbook = batchDeleteGuestbook;

// =====================================================
// Data Loading
// =====================================================
async function loadGuestbookMessages() {
    showGuestbookLoading(true);

    try {
        const supabase = window.supabaseClient;
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase
            .from('guestbook')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        guestbookMessages = data || [];
        applyFilters();
        updateGuestbookCount();
    } catch (error) {
        console.error('Failed to load guestbook messages:', error);
        showAdminToast('加载留言失败: ' + error.message, 'error');
    } finally {
        showGuestbookLoading(false);
    }
}

// =====================================================
// Filtering & Rendering
// =====================================================
function applyFilters() {
    const searchQuery = document.getElementById('guestbookSearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('guestbookStatusFilter')?.value || 'all';

    filteredMessages = guestbookMessages.filter(msg => {
        // Search filter
        const matchesSearch = !searchQuery ||
            msg.author.toLowerCase().includes(searchQuery) ||
            msg.content.toLowerCase().includes(searchQuery);

        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'pending') {
            matchesStatus = !msg.is_approved;
        } else if (statusFilter === 'approved') {
            matchesStatus = msg.is_approved;
        } else if (statusFilter === 'featured') {
            matchesStatus = msg.is_featured;
        }

        return matchesSearch && matchesStatus;
    });

    renderGuestbookTable();
    updateSelectionUI();
}

function renderGuestbookTable() {
    const tbody = document.getElementById('guestbookTableBody');
    const emptyState = document.getElementById('guestbookEmptyState');

    if (!tbody) return;

    if (filteredMessages.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filteredMessages.map(msg => createGuestbookRow(msg)).join('');

    // Add event listeners for checkboxes
    tbody.querySelectorAll('.message-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => toggleMessageSelection(checkbox.dataset.id));
    });
}

function createGuestbookRow(message) {
    const isSelected = selectedMessageIds.has(message.id);
    const contentPreview = message.content.length > 50
        ? message.content.substring(0, 50) + '...'
        : message.content;
    const formattedTime = formatDate(message.created_at);

    const statusBadges = [];
    if (message.is_featured) {
        statusBadges.push('<span class="badge badge-primary">⭐ 置顶</span>');
    }
    if (message.is_approved) {
        statusBadges.push('<span class="badge badge-success">已审核</span>');
    } else {
        statusBadges.push('<span class="badge badge-warning">待审核</span>');
    }

    return `
        <tr data-id="${message.id}">
            <td>
                <input type="checkbox" class="message-checkbox" data-id="${message.id}" ${isSelected ? 'checked' : ''}>
            </td>
            <td class="author-cell">${escapeHtml(message.author)}</td>
            <td class="content-cell" title="${escapeHtml(message.content)}">${escapeHtml(contentPreview)}</td>
            <td class="likes-cell">❤️ ${message.likes_count || 0}</td>
            <td class="time-cell">${formattedTime}</td>
            <td class="status-cell">${statusBadges.join(' ')}</td>
            <td class="actions-cell">
                <div class="action-buttons">
                    ${message.is_approved
            ? `<button onclick="toggleApproval('${message.id}', false)" class="btn-small btn-warning" title="取消审核">取消审核</button>`
            : `<button onclick="toggleApproval('${message.id}', true)" class="btn-small btn-success" title="审核通过">审核通过</button>`
        }
                    ${message.is_featured
            ? `<button onclick="toggleFeatured('${message.id}', false)" class="btn-small btn-secondary" title="取消置顶">取消置顶</button>`
            : `<button onclick="toggleFeatured('${message.id}', true)" class="btn-small btn-primary" title="置顶">置顶</button>`
        }
                    <button onclick="deleteGuestbookMessage('${message.id}')" class="btn-small btn-danger" title="删除">删除</button>
                </div>
            </td>
        </tr>
    `;
}

function updateGuestbookCount() {
    const countEl = document.getElementById('guestbookCount');
    if (countEl) {
        const pending = guestbookMessages.filter(m => !m.is_approved).length;
        const total = guestbookMessages.length;
        countEl.textContent = `共 ${total} 条留言，${pending} 条待审核`;
    }
}

// =====================================================
// Search & Filter Handlers
// =====================================================
function onGuestbookSearchInput() {
    // Debounce search
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
}

function onGuestbookFilterChange() {
    applyFilters();
}

function clearGuestbookFilters() {
    const searchInput = document.getElementById('guestbookSearchInput');
    const statusFilter = document.getElementById('guestbookStatusFilter');

    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = 'all';

    applyFilters();
}

// =====================================================
// Selection & Batch Operations
// =====================================================
function toggleMessageSelection(id) {
    if (selectedMessageIds.has(id)) {
        selectedMessageIds.delete(id);
    } else {
        selectedMessageIds.add(id);
    }
    updateSelectionUI();
}

function toggleGuestbookSelectAll() {
    const selectAllCheckbox = document.getElementById('guestbookSelectAll');
    const isChecked = selectAllCheckbox?.checked;

    if (isChecked) {
        filteredMessages.forEach(msg => selectedMessageIds.add(msg.id));
    } else {
        selectedMessageIds.clear();
    }

    // Update individual checkboxes
    document.querySelectorAll('.message-checkbox').forEach(checkbox => {
        checkbox.checked = isChecked;
    });

    updateSelectionUI();
}

function updateSelectionUI() {
    const batchActions = document.getElementById('guestbookBatchActions');
    const selectedCount = document.getElementById('guestbookSelectedCount');
    const selectAllCheckbox = document.getElementById('guestbookSelectAll');

    if (batchActions) {
        batchActions.style.display = selectedMessageIds.size > 0 ? 'flex' : 'none';
    }

    if (selectedCount) {
        selectedCount.textContent = selectedMessageIds.size;
    }

    // Update select all checkbox state
    if (selectAllCheckbox) {
        const allSelected = filteredMessages.length > 0 &&
            filteredMessages.every(msg => selectedMessageIds.has(msg.id));
        selectAllCheckbox.checked = allSelected;
    }
}

async function batchApproveGuestbook() {
    if (selectedMessageIds.size === 0) return;

    const ids = [...selectedMessageIds];

    try {
        const supabase = window.supabaseClient;
        const { error } = await supabase
            .from('guestbook')
            .update({ is_approved: true })
            .in('id', ids);

        if (error) throw error;

        showAdminToast(`已审核 ${ids.length} 条留言`);
        selectedMessageIds.clear();
        await loadGuestbookMessages();
    } catch (error) {
        console.error('Batch approve failed:', error);
        showAdminToast('批量审核失败: ' + error.message, 'error');
    }
}

async function batchDeleteGuestbook() {
    if (selectedMessageIds.size === 0) return;

    if (!confirm(`确定要删除 ${selectedMessageIds.size} 条留言吗？此操作不可恢复！`)) {
        return;
    }

    const ids = [...selectedMessageIds];

    try {
        const supabase = window.supabaseClient;
        const { error } = await supabase
            .from('guestbook')
            .delete()
            .in('id', ids);

        if (error) throw error;

        showAdminToast(`已删除 ${ids.length} 条留言`);
        selectedMessageIds.clear();
        await loadGuestbookMessages();
    } catch (error) {
        console.error('Batch delete failed:', error);
        showAdminToast('批量删除失败: ' + error.message, 'error');
    }
}

// =====================================================
// Individual Actions
// =====================================================
window.toggleApproval = async function (id, approve) {
    try {
        const supabase = window.supabaseClient;
        const { error } = await supabase
            .from('guestbook')
            .update({ is_approved: approve })
            .eq('id', id);

        if (error) throw error;

        showAdminToast(approve ? '留言已审核' : '已取消审核');

        // Update local state
        const msg = guestbookMessages.find(m => m.id === id);
        if (msg) msg.is_approved = approve;
        applyFilters();
        updateGuestbookCount();
    } catch (error) {
        console.error('Toggle approval failed:', error);
        showAdminToast('操作失败: ' + error.message, 'error');
    }
};

window.toggleFeatured = async function (id, featured) {
    try {
        const supabase = window.supabaseClient;
        const { error } = await supabase
            .from('guestbook')
            .update({ is_featured: featured })
            .eq('id', id);

        if (error) throw error;

        showAdminToast(featured ? '留言已置顶' : '已取消置顶');

        // Update local state
        const msg = guestbookMessages.find(m => m.id === id);
        if (msg) msg.is_featured = featured;
        applyFilters();
    } catch (error) {
        console.error('Toggle featured failed:', error);
        showAdminToast('操作失败: ' + error.message, 'error');
    }
};

window.deleteGuestbookMessage = async function (id) {
    const msg = guestbookMessages.find(m => m.id === id);
    const preview = msg ? msg.author + ': ' + msg.content.substring(0, 30) + '...' : '';

    if (!confirm(`确定要删除这条留言吗？\n\n${preview}\n\n此操作不可恢复！`)) {
        return;
    }

    try {
        const supabase = window.supabaseClient;
        const { error } = await supabase
            .from('guestbook')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showAdminToast('留言已删除');

        // Remove from local state
        guestbookMessages = guestbookMessages.filter(m => m.id !== id);
        selectedMessageIds.delete(id);
        applyFilters();
        updateGuestbookCount();
    } catch (error) {
        console.error('Delete failed:', error);
        showAdminToast('删除失败: ' + error.message, 'error');
    }
};

// =====================================================
// UI Helpers
// =====================================================
function showGuestbookLoading(show) {
    const tbody = document.getElementById('guestbookTableBody');
    if (!tbody) return;

    if (show) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-row">
                    <div class="spinner"></div>
                    <p>加载中...</p>
                </td>
            </tr>
        `;
    }
}

function showAdminToast(message, type = 'success') {
    // Use existing toast from admin.js if available
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = 'toast ' + (type === 'error' ? 'toast-error' : 'toast-success');
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } else {
        // Fallback to alert
        if (type === 'error') {
            console.error(message);
        } else {
            console.log(message);
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;

    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
