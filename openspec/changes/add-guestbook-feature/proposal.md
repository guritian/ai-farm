# Add Guestbook Feature

## Why

AI Farm currently lacks user interaction features. Adding a guestbook enables visitors to share feedback, experiences, and suggestions, building community engagement and providing valuable insights into user needs.

## What Changes

- Create new `guestbook` table in Supabase database with message storage and approval workflow
- Add new `guestbook.html` page for public message viewing and submission
- Extend admin interface (`admin.html`) with guestbook moderation tab
- Implement like/heart interaction with LocalStorage-based duplicate prevention
- Add sorting options (newest, most liked) and search functionality

###Breaking Changes
None - this is a new feature addition.

## Impact

### Affected Specs
- **NEW**: `guestbook-data` - Database schema for message storage
- **NEW**: `guestbook-ui` - Frontend page and user interactions
- **NEW**: `guestbook-admin` - Admin moderation interface
- **MODIFIED**: Navigation system (add guestbook link)

### Affected Code
- Database: New `guestbook` table
- Frontend: New `guestbook.html`, `scripts/guestbook.js`, `styles/guestbook.css`
- Admin: Modified `admin.html`, new `scripts/admin-guestbook.js`
- Navigation: Modified `index.html` (add tab)

---

## Detailed Design Considerations

### UI/UX Design Strategy

**Design System Applied**: Community/Forum Landing pattern with vibrant & block-based style

**Color Palette Decision**: ✅ **已确认** - 使用浅蓝色主题 (#0EA5E9) 保持与现有页面一致

**Key Design Principles**:
- Large sections with 48px+ gaps for spacious feel
- Animated patterns and bold hover effects (color shift)
- Large typography (32px+) for headers
- 200-300ms transitions for smooth interactions

### Content Moderation Strategy

**Initial Approach**: Manual moderation only
- All messages default to `is_approved = false`
- Admin must manually approve before public visibility
- Quick delete action for spam/inappropriate content
- ✅ **已确认** - 支持置顶功能，管理员可将留言置顶显示

**Future Enhancements** (out of scope):
-Automated sentiment analysis
- Keyword filtering
- User reputation system
- Community reporting

### Technical Architecture

**Frontend**:
- Standalone `guestbook.html` page
- Client-side JavaScript for dynamic loading
- ✅ LocalStorage for like tracking (no authentication required)
- ✅ 分页加载，默认每页 10 条留言
- Responsive design (mobile-first)
- ✅ 移除邮箱字段，简化表单

**Backend**:
- Supabase for data persistence
- Optional RLS policies for security
- Simple CRUD operations via Supabase client

**Admin**:
- Tab-based integration into existing admin.html
- Real-time search and filtering
- Batch operations for efficiency
- ✅ 置顶功能支持

---

## Success Criteria

1. **Functional Completeness**:
   - Users can submit messages (name, content, optional email)
   - Messages display correctly after approval
   - Like functionality works with duplicate prevention
   - Admin can approve/reject/delete messages

2. **UI/UX Quality**:
   - Page matches design system guidelines
   - Smooth animations (60 FPS)
   - Mobile responsive (375px+)
   - Loading states provide feedback

3. **Data Integrity**:
   - All messages persist correctly
   - Likes increment accurately
   - Timestamps in UTC
   - No orphaned records

4. **Performance**:
   - Initial page load < 2s
   - Message list renders < 500ms
   - Like interaction < 200ms

---

## Timeline Estimate

- **Database Design**: 0.5 hours
- **Frontend Development**: 2 hours
- **Admin Integration**: 1 hour
- **Testing & Polish**: 1 hour
- **Total**: ~4.5 hours

---

## ✅ Decisions Confirmed

1. **Theme**: 浅蓝色 (#0EA5E9) - 保持与现有页面一致
2. **Pagination**: 默认 10 条/页，使用分页导航
3. **Contact Info**: 暂不需要邮箱/微信字段
4. **Like Prevention**: 使用 LocalStorage 防重复点赞
5. **Featured Messages**: 需要置顶功能
6. **Character Limits**: 最多 2000 字符
