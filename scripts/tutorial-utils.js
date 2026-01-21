
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
