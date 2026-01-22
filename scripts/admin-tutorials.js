// AI Farm - 教程管理脚本
// 用于管理后台的教程 CRUD 功能

// ============================================
// 全局状态
// ============================================
let currentTutorials = [];
let currentEditingId = null;
let allTools = []; // 存储所有工具用于下拉选择

// ============================================
// 初始化
// ============================================
async function initTutorials() {
    await loadAllTools(); // 加载工具列表
    await loadTutorials();
}

// ============================================
// 加载工具列表（用于关联工具下拉）
// ============================================
async function loadAllTools() {
    try {
        const supabase = window.supabaseAdmin;
        const { data, error } = await supabase
            .from('ai_tools')
            .select('id, name')
            .order('name');

        if (error) throw error;
        allTools = data || [];
    } catch (error) {
        console.error('加载工具列表失败:', error);
    }
}

// ============================================
// 加载教程列表
// ============================================
async function loadTutorials() {
    try {
        const tbody = document.getElementById('tutorialsTableBody');
        const emptyState = document.getElementById('tutorialsEmptyState');

        // 显示加载状态
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-row">
                    <div class="spinner"></div>
                    <p>加载中...</p>
                </td>
            </tr>
        `;

        const supabase = window.supabaseAdmin;
        const { data, error } = await supabase
            .from('tutorials')
            .select(`
                *,
                ai_tools (
                    id,
                    name
                )
            `)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;

        currentTutorials = data || [];

        if (currentTutorials.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
            renderTutorialsTable(currentTutorials);
        }

    } catch (error) {
        console.error('加载教程失败:', error);
        showToast('加载教程失败: ' + error.message, 'error');
    }
}

// ============================================
// 渲染教程表格
// ============================================
function renderTutorialsTable(tutorials) {
    const tbody = document.getElementById('tutorialsTableBody');

    tbody.innerHTML = tutorials.map((tutorial, index) => {
        const typeLabel = getTypeLabel(tutorial.content_type);
        const toolName = tutorial.ai_tools?.name || '-';
        const featuredBadge = tutorial.is_featured ? '★' : '';
        const date = new Date(tutorial.created_at).toLocaleDateString('zh-CN');

        return `
            <tr>
                <td>
                    <div class="sort-controls">
                        <button class="btn-sort" onclick="moveTutorialUp('${tutorial.id}')" title="上移" ${index === 0 ? 'disabled' : ''}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 15l-6-6-6 6"/>
                            </svg>
                        </button>
                        <span class="sort-order">${tutorial.display_order || index + 1}</span>
                        <button class="btn-sort" onclick="moveTutorialDown('${tutorial.id}')" title="下移" ${index === tutorials.length - 1 ? 'disabled' : ''}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </button>
                    </div>
                </td>
                <td><strong>${escapeHtml(tutorial.title)}</strong></td>
                <td><span class="type-badge type-${tutorial.content_type}">${typeLabel}</span></td>
                <td>${escapeHtml(tutorial.author)}</td>
                <td>${toolName}</td>
                <td>${featuredBadge ? '<span class="badge-featured">★ 推荐</span>' : '-'}</td>
                <td>${date}</td>
                <td class="actions">
                    <button onclick="openEditTutorialForm('${tutorial.id}')" class="btn-icon" title="编辑">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button onclick="openDeleteTutorialModal('${tutorial.id}', '${escapeHtml(tutorial.title)}')" class="btn-icon btn-danger" title="删除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// 获取类型标签
// ============================================
function getTypeLabel(type) {
    const labels = {
        'markdown': 'MD',
        'url': '链接',
        'video': '视频'
    };
    return labels[type] || type;
}

// ============================================
// 打开添加教程表单
// ============================================
function openAddTutorialForm() {
    currentEditingId = null;
    document.getElementById('tutorialModalTitle').textContent = '添加教程';
    document.getElementById('tutorialForm').reset();
    document.getElementById('tutorialId').value = '';

    // 加载工具下拉选项
    populateToolSelect();

    // 默认选择 Markdown
    document.getElementById('contentType').value = 'markdown';
    toggleContentInput('markdown');

    document.getElementById('tutorialModal').style.display = 'flex';
}

// ============================================
// 填充工具下拉选择
// ============================================
function populateToolSelect() {
    const select = document.getElementById('tutorialToolId');
    select.innerHTML = '<option value="">无（通用教程）</option>' +
        allTools.map(tool => `<option value="${tool.id}">${escapeHtml(tool.name)}</option>`).join('');
}

// ============================================
// 打开编辑教程表单
// ============================================
async function openEditTutorialForm(id) {
    currentEditingId = id;
    const tutorial = currentTutorials.find(t => t.id === id);

    if (!tutorial) {
        showToast('未找到教程', 'error');
        return;
    }

    document.getElementById('tutorialModalTitle').textContent = '编辑教程';
    document.getElementById('tutorialId').value = id;
    document.getElementById('tutorialTitle').value = tutorial.title;
    document.getElementById('tutorialAuthor').value = tutorial.author;
    document.getElementById('tutorialCoverImage').value = tutorial.cover_image || '';
    document.getElementById('tutorialSummary').value = tutorial.summary || '';
    document.getElementById('tutorialTags').value = tutorial.tags ? tutorial.tags.join(', ') : '';
    document.getElementById('tutorialIsFeatured').checked = tutorial.is_featured;
    document.getElementById('contentType').value = tutorial.content_type;

    // 填充工具选择并设置当前值
    populateToolSelect();
    document.getElementById('tutorialToolId').value = tutorial.tool_id || '';

    // 根据类型填充内容
    toggleContentInput(tutorial.content_type);

    if (tutorial.content_type === 'markdown') {
        document.getElementById('tutorialContentMd').value = tutorial.content_md || '';
    } else {
        document.getElementById('tutorialExternalUrl').value = tutorial.external_url || '';
    }

    document.getElementById('tutorialModal').style.display = 'flex';
}

// ============================================
// 内容类型切换
// ============================================
function toggleContentInput(type) {
    const markdownGroup = document.getElementById('markdownGroup');
    const urlGroup = document.getElementById('urlGroup');

    if (type === 'markdown') {
        markdownGroup.style.display = 'block';
        urlGroup.style.display = 'none';
        document.getElementById('tutorialContentMd').required = true;
        document.getElementById('tutorialExternalUrl').required = false;
    } else {
        markdownGroup.style.display = 'none';
        urlGroup.style.display = 'block';
        document.getElementById('tutorialContentMd').required = false;
        document.getElementById('tutorialExternalUrl').required = true;
    }
}

// 内容类型选择变化时
window.onContentTypeChange = function () {
    const type = document.getElementById('contentType').value;

    // 如果是编辑模式且切换类型，警告用户
    if (currentEditingId) {
        const tutorial = currentTutorials.find(t => t.id === currentEditingId);
        if (tutorial && tutorial.content_type !== type) {
            if (!confirm('切换内容类型将清空现有内容，确定吗？')) {
                document.getElementById('contentType').value = tutorial.content_type;
                return;
            }
        }
    }

    toggleContentInput(type);
};

// ============================================
// 提交教程表单
// ============================================
async function handleTutorialSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('tutorialSubmitBtn');
    const submitText = document.getElementById('tutorialSubmitText');
    const submitLoading = document.getElementById('tutorialSubmitLoading');

    try {
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline-flex';

        const supabase = window.supabaseAdmin;
        const id = document.getElementById('tutorialId').value;
        const contentType = document.getElementById('contentType').value;

        // 构建数据对象
        const tutorialData = {
            title: document.getElementById('tutorialTitle').value,
            author: document.getElementById('tutorialAuthor').value,
            cover_image: document.getElementById('tutorialCoverImage').value || 'images/placeholders/tutorial.png',
            summary: document.getElementById('tutorialSummary').value,
            tags: document.getElementById('tutorialTags').value.split(',').map(t => t.trim()).filter(t => t),
            is_featured: document.getElementById('tutorialIsFeatured').checked,
            content_type: contentType,
            tool_id: document.getElementById('tutorialToolId').value || null
        };

        // 根据类型添加内容
        if (contentType === 'markdown') {
            tutorialData.content_md = document.getElementById('tutorialContentMd').value;
            tutorialData.external_url = null;
        } else {
            tutorialData.external_url = document.getElementById('tutorialExternalUrl').value;
            tutorialData.content_md = null;
        }

        let error;
        if (id) {
            // 更新
            ({ error } = await supabase
                .from('tutorials')
                .update(tutorialData)
                .eq('id', id));
        } else {
            // 新增
            ({ error } = await supabase
                .from('tutorials')
                .insert([tutorialData]));
        }

        if (error) throw error;

        showToast(id ? '教程更新成功' : '教程添加成功', 'success');
        closeTutorialModal();
        await loadTutorials();

    } catch (error) {
        console.error('保存教程失败:', error);
        showToast('保存失败: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoading.style.display = 'none';
    }
}

// ============================================
// 打开删除确认对话框
// ============================================
function openDeleteTutorialModal(id, title) {
    currentEditingId = id;
    document.getElementById('deleteTutorialName').textContent = title;
    document.getElementById('tutorialDeleteModal').style.display = 'flex';
}

// ============================================
// 确认删除教程
// ============================================
async function confirmDeleteTutorial() {
    const deleteBtn = document.getElementById('tutorialDeleteBtn');
    const deleteText = document.getElementById('tutorialDeleteText');
    const deleteLoading = document.getElementById('tutorialDeleteLoading');

    try {
        deleteBtn.disabled = true;
        deleteText.style.display = 'none';
        deleteLoading.style.display = 'inline-flex';

        const supabase = window.supabaseAdmin;
        const { error } = await supabase
            .from('tutorials')
            .delete()
            .eq('id', currentEditingId);

        if (error) throw error;

        showToast('教程删除成功', 'success');
        closeTutorialDeleteModal();
        await loadTutorials();

    } catch (error) {
        console.error('删除教程失败:', error);
        showToast('删除失败: ' + error.message, 'error');
    } finally {
        deleteBtn.disabled = false;
        deleteText.style.display = 'inline';
        deleteLoading.style.display = 'none';
    }
}

// ============================================
// 搜索教程
// ============================================
function searchTutorials() {
    const query = document.getElementById('tutorialSearchInput').value.toLowerCase();

    if (!query) {
        renderTutorialsTable(currentTutorials);
        return;
    }

    const filtered = currentTutorials.filter(tutorial =>
        tutorial.title.toLowerCase().includes(query) ||
        tutorial.author.toLowerCase().includes(query) ||
        (tutorial.summary && tutorial.summary.toLowerCase().includes(query))
    );

    renderTutorialsTable(filtered);
}

// 添加防抖
let searchTimeout;
window.onTutorialSearchInput = function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchTutorials, 300);
};

// ============================================
// 清除筛选
// ============================================
function clearTutorialFilters() {
    document.getElementById('tutorialSearchInput').value = '';
    renderTutorialsTable(currentTutorials);
}

// ============================================
// 关闭模态框
// ============================================
function closeTutorialModal() {
    document.getElementById('tutorialModal').style.display = 'none';
    currentEditingId = null;
}

function closeTutorialDeleteModal() {
    document.getElementById('tutorialDeleteModal').style.display = 'none';
    currentEditingId = null;
}

// ============================================
// 工具函数
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.initTutorials = initTutorials;
window.openAddTutorialForm = openAddTutorialForm;
window.openEditTutorialForm = openEditTutorialForm;
window.handleTutorialSubmit = handleTutorialSubmit;
window.openDeleteTutorialModal = openDeleteTutorialModal;
window.confirmDeleteTutorial = confirmDeleteTutorial;
window.closeTutorialModal = closeTutorialModal;
window.closeTutorialDeleteModal = closeTutorialDeleteModal;
window.clearTutorialFilters = clearTutorialFilters;

// ============================================
// 排序功能
// ============================================

/**
 * 上移教程
 */
window.moveTutorialUp = async function (id) {
    const index = currentTutorials.findIndex(t => t.id === id);
    if (index <= 0) return;

    const current = currentTutorials[index];
    const prev = currentTutorials[index - 1];

    await swapTutorialOrder(current, prev);
};

/**
 * 下移教程
 */
window.moveTutorialDown = async function (id) {
    const index = currentTutorials.findIndex(t => t.id === id);
    if (index < 0 || index >= currentTutorials.length - 1) return;

    const current = currentTutorials[index];
    const next = currentTutorials[index + 1];

    await swapTutorialOrder(current, next);
};

/**
 * 交换两个教程的顺序
 */
async function swapTutorialOrder(t1, t2) {
    const order1 = t1.display_order || 0;
    const order2 = t2.display_order || 0;

    try {
        const supabase = window.supabaseAdmin;

        await supabase
            .from('tutorials')
            .update({ display_order: order2 })
            .eq('id', t1.id);

        await supabase
            .from('tutorials')
            .update({ display_order: order1 })
            .eq('id', t2.id);

        await loadTutorials();
        showToast('顺序已更新');
    } catch (error) {
        console.error('❌ 更新顺序失败:', error);
        showToast('更新顺序失败: ' + error.message, 'error');
    }
}
