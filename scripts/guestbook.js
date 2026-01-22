/**
 * Guestbook Module - AI Farm
 * Handles message display, submission, likes, and pagination
 */

// =====================================================
// Configuration
// =====================================================
const GUESTBOOK_CONFIG = {
    pageSize: 10,
    minContentLength: 10,
    maxContentLength: 2000,
    localStorageKey: 'ai-farm-guestbook-likes'
};

// =====================================================
// State
// =====================================================
let currentPage = 1;
let currentSort = 'newest'; // 'newest' or 'popular'
let totalPages = 1;
let totalMessages = 0;
let likedMessages = new Set();
let isInitialized = false;

// =====================================================
// Initialization
// =====================================================
async function initGuestbook() {
    if (isInitialized) {
        // Already initialized, just load messages
        await loadMessages();
        return;
    }

    // Load liked messages from localStorage
    loadLikedMessages();

    // Set up event listeners
    setupEventListeners();

    // Load initial messages
    await loadMessages();

    isInitialized = true;
}

// Export loadGuestbook for tab switching
window.loadGuestbook = initGuestbook;

function loadLikedMessages() {
    try {
        const stored = localStorage.getItem(GUESTBOOK_CONFIG.localStorageKey);
        if (stored) {
            likedMessages = new Set(JSON.parse(stored));
        }
    } catch (e) {
        console.error('Failed to load liked messages:', e);
        likedMessages = new Set();
    }
}

function saveLikedMessages() {
    try {
        localStorage.setItem(
            GUESTBOOK_CONFIG.localStorageKey,
            JSON.stringify([...likedMessages])
        );
    } catch (e) {
        console.error('Failed to save liked messages:', e);
    }
}

function setupEventListeners() {
    // Form submission
    const form = document.getElementById('guestbook-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    // Character counter
    const contentInput = document.getElementById('content');
    if (contentInput) {
        contentInput.addEventListener('input', updateCharCounter);
    }

    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => handleSortChange(btn.dataset.sort));
    });

    // Form reset
    const resetBtn = form?.querySelector('button[type="reset"]');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            setTimeout(() => {
                updateCharCounter();
                clearErrors();
            }, 0);
        });
    }
}

// =====================================================
// Message Loading
// =====================================================
async function loadMessages() {
    showLoading(true);
    hideEmpty();

    try {
        const supabase = window.supabaseClient;
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        // Build query for approved messages
        let query = supabase
            .from('guestbook')
            .select('*', { count: 'exact' })
            .eq('is_approved', true);

        // Apply sorting - featured messages always first
        if (currentSort === 'popular') {
            query = query
                .order('is_featured', { ascending: false })
                .order('likes_count', { ascending: false })
                .order('created_at', { ascending: false });
        } else {
            query = query
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false });
        }

        // Apply pagination
        const from = (currentPage - 1) * GUESTBOOK_CONFIG.pageSize;
        const to = from + GUESTBOOK_CONFIG.pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        totalMessages = count || 0;
        totalPages = Math.ceil(totalMessages / GUESTBOOK_CONFIG.pageSize);

        // Update message count badge
        updateMessageCount();

        if (data && data.length > 0) {
            renderMessages(data);
            renderPagination();
        } else {
            showEmpty();
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
        showToast('加载留言失败，请刷新重试', 'error');
    } finally {
        showLoading(false);
    }
}

function renderMessages(messages) {
    const grid = document.getElementById('messages-grid');
    if (!grid) return;

    grid.innerHTML = messages.map(msg => createMessageCard(msg)).join('');

    // Add click handlers for like buttons
    grid.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', () => handleLike(btn.dataset.id));
    });
}

function createMessageCard(message) {
    const isLiked = likedMessages.has(message.id);
    const isFeatured = message.is_featured;
    const relativeTime = getRelativeTime(message.created_at);
    const avatarLetter = message.author.charAt(0).toUpperCase();

    return `
        <article class="message-card ${isFeatured ? 'featured' : ''}">
            ${isFeatured ? `
                <span class="featured-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    置顶
                </span>
            ` : ''}
            <div class="message-header">
                <div class="author-info">
                    <div class="author-avatar">${avatarLetter}</div>
                    <div class="author-details">
                        <span class="message-author">${escapeHtml(message.author)}</span>
                        <span class="message-time">${relativeTime}</span>
                    </div>
                </div>
            </div>
            <p class="message-content">${escapeHtml(message.content)}</p>
            <div class="message-footer">
                <button class="like-btn ${isLiked ? 'liked' : ''}" 
                        data-id="${message.id}"
                        ${isLiked ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                              stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${message.likes_count || 0}</span>
                </button>
            </div>
        </article>
    `;
}

// =====================================================
// Pagination
// =====================================================
function renderPagination() {
    const container = document.querySelector('.pagination') || createPaginationContainer();
    if (!container) return;

    if (totalPages <= 1) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    let html = '';

    // Previous button
    html += `
        <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
            ← 上一页
        </button>
    `;

    // Page numbers
    const pages = getPageNumbers();
    pages.forEach(page => {
        if (page === '...') {
            html += '<span class="pagination-ellipsis">...</span>';
        } else {
            html += `
                <button class="pagination-btn ${page === currentPage ? 'active' : ''}" data-page="${page}">
                    ${page}
                </button>
            `;
        }
    });

    // Next button
    html += `
        <button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
            下一页 →
        </button>
    `;

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                goToPage(page);
            }
        });
    });
}

function createPaginationContainer() {
    const section = document.querySelector('.messages-section');
    if (!section) return null;

    const container = document.createElement('div');
    container.className = 'pagination';
    section.appendChild(container);
    return container;
}

function getPageNumbers() {
    const pages = [];
    const showPages = 5; // Max page buttons to show

    if (totalPages <= showPages) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
    }

    return pages;
}

async function goToPage(page) {
    currentPage = page;

    // Scroll to messages section
    const section = document.querySelector('.messages-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    await loadMessages();
}

// =====================================================
// Sorting
// =====================================================
function handleSortChange(sort) {
    if (sort === currentSort) return;

    currentSort = sort;
    currentPage = 1;

    // Update button states
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === sort);
    });

    loadMessages();
}

// =====================================================
// Form Submission
// =====================================================
async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const authorInput = document.getElementById('author');
    const contentInput = document.getElementById('content');
    const submitBtn = document.getElementById('submit-btn');

    // Clear previous errors
    clearErrors();

    // Validate
    const author = authorInput.value.trim();
    const content = contentInput.value.trim();

    let hasError = false;

    if (!author) {
        showError('author', '请输入姓名');
        hasError = true;
    }

    if (!content) {
        showError('content', '请输入留言内容');
        hasError = true;
    } else if (content.length < GUESTBOOK_CONFIG.minContentLength) {
        showError('content', `留言至少需要 ${GUESTBOOK_CONFIG.minContentLength} 个字符`);
        hasError = true;
    }

    if (hasError) return;

    // Show loading state
    setSubmitting(true);

    try {
        const supabase = window.supabaseClient;
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { error } = await supabase
            .from('guestbook')
            .insert({
                author: author,
                content: content
            });

        if (error) throw error;

        // Success
        showToast('留言已提交，审核后将显示！');
        form.reset();
        updateCharCounter();
    } catch (error) {
        console.error('Submit failed:', error);
        showToast('提交失败，请稍后重试', 'error');
    } finally {
        setSubmitting(false);
    }
}

function setSubmitting(isSubmitting) {
    const submitBtn = document.getElementById('submit-btn');
    if (!submitBtn) return;

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    submitBtn.disabled = isSubmitting;
    if (btnText) btnText.style.display = isSubmitting ? 'none' : 'inline';
    if (btnLoading) btnLoading.style.display = isSubmitting ? 'inline-flex' : 'none';
}

// =====================================================
// Like Functionality
// =====================================================
async function handleLike(messageId) {
    if (likedMessages.has(messageId)) return;

    const btn = document.querySelector(`.like-btn[data-id="${messageId}"]`);
    if (!btn) return;

    // Optimistic update
    btn.classList.add('liked', 'animating');
    btn.disabled = true;
    const countSpan = btn.querySelector('span');
    const currentCount = parseInt(countSpan.textContent) || 0;
    countSpan.textContent = currentCount + 1;

    // Update SVG fill
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', '#EF4444');

    // Remove animation class after it completes
    setTimeout(() => btn.classList.remove('animating'), 300);

    try {
        const supabase = window.supabaseClient;
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        // Call increment function or update directly
        const { data, error } = await supabase.rpc('increment_guestbook_likes', {
            message_id: messageId
        });

        if (error) {
            // If RPC doesn't exist, try direct update
            const { error: updateError } = await supabase
                .from('guestbook')
                .update({ likes_count: currentCount + 1 })
                .eq('id', messageId);

            if (updateError) throw updateError;
        }

        // Save to localStorage
        likedMessages.add(messageId);
        saveLikedMessages();
    } catch (error) {
        console.error('Like failed:', error);

        // Revert optimistic update
        btn.classList.remove('liked');
        btn.disabled = false;
        countSpan.textContent = currentCount;
        if (svg) svg.setAttribute('fill', 'none');

        showToast('点赞失败，请重试', 'error');
    }
}

// =====================================================
// UI Helpers
// =====================================================
function showLoading(show) {
    const loading = document.getElementById('messages-loading');
    if (loading) loading.style.display = show ? 'flex' : 'none';
}

function showEmpty() {
    const empty = document.getElementById('messages-empty');
    const grid = document.getElementById('messages-grid');
    if (empty) empty.style.display = 'flex';
    if (grid) grid.innerHTML = '';
}

function hideEmpty() {
    const empty = document.getElementById('messages-empty');
    if (empty) empty.style.display = 'none';
}

function updateCharCounter() {
    const content = document.getElementById('content');
    const counter = document.getElementById('char-counter');
    const barFill = document.getElementById('char-bar-fill');
    if (!content || !counter) return;

    const length = content.value.length;
    const max = GUESTBOOK_CONFIG.maxContentLength;
    const percent = (length / max) * 100;

    counter.textContent = `${length} / ${max}`;

    // Update bar fill
    if (barFill) {
        barFill.style.width = `${Math.min(percent, 100)}%`;
        barFill.classList.remove('warning', 'danger');
        if (percent > 95) {
            barFill.classList.add('danger');
        } else if (percent > 80) {
            barFill.classList.add('warning');
        }
    }

    counter.classList.remove('warning', 'danger');
    if (length > max * 0.95) {
        counter.classList.add('danger');
    } else if (length > max * 0.8) {
        counter.classList.add('warning');
    }
}

function updateMessageCount() {
    const countEl = document.getElementById('message-count');
    if (countEl) {
        countEl.textContent = totalMessages;
    }
}

function showError(field, message) {
    const errorEl = document.getElementById(`${field}-error`);
    if (errorEl) {
        errorEl.textContent = message;
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('success-toast');
    const messageEl = document.getElementById('toast-message');
    if (!toast || !messageEl) return;

    messageEl.textContent = message;
    toast.classList.remove('error');
    if (type === 'error') {
        toast.classList.add('error');
    }

    toast.style.display = 'flex';
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
    }, 3000);
}

// =====================================================
// Utility Functions
// =====================================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    if (days < 30) return `${Math.floor(days / 7)} 周前`;
    if (days < 365) return `${Math.floor(days / 30)} 个月前`;
    return `${Math.floor(days / 365)} 年前`;
}

// Export for potential external use
window.guestbook = {
    loadMessages,
    goToPage,
    handleSortChange
};
