# tutorial-admin Specification

**Capability**: tutorial-admin  
**Type**: New  
**Change**: enhance-tutorial-management

---

## Overview

Provides comprehensive tutorial management interface in the admin backend, allowing administrators to create, read, update, and delete tutorials with support for multiple content types (Markdown, external URL, video).

---

## ADDED Requirements

### Requirement: Display Tutorial List

#### Context
Administrators need to view all tutorials in a table format with key information and action buttons.

#### Scenario: View tutorial list on page load
**GIVEN** the administrator opens admin.html and clicks the "教程管理" tab  
**WHEN** the page loads  
**THEN** the system should:
- Display a table with columns: Title, Author, Type, Tool, Featured, Created Date, Actions
- Show tutorial count (e.g., "共 10 个教程")
- Display action buttons (Edit, Delete) for each tutorial
- Show "推荐" badge for featured tutorials
- Show content type icon/label (Markdown/URL/Video)

**VALIDATION**:
- ✅ Table displays all tutorials from Supabase
- ✅ Content type显示正确（markdown/url/video）
- ✅ Featured tutorials show ★ icon

---

### Requirement: Add Tutorial Form

#### Context
Administrators need a form to create new tutorials with different content types.

#### Scenario: Open add tutorial modal
**GIVEN** the administrator is on the tutorial management tab  
**WHEN** clicking the "添加教程" button  
**THEN** the system should:
- Show a modal dialog with add tutorial form
- Display fields: Title, Author, Content Type selector, Tags, Cover Image URL, Featured checkbox
- Show conditional input based on content type:
  - Markdown: Large textarea for Markdown content
  - URL: Input field for external link
  - Video: Input field for video URL
- Display "关联工具" dropdown (optional) with all AI tools
- Provide "保存" and "取消" buttons

**VALIDATION**:
- ✅ Form fields appear correctly
- ✅ Content type selection changes input area
- ✅ Tool dropdown loads all tools from ai_tools table

#### Scenario: Submit new Markdown tutorial
**GIVEN** the add tutorial form is open  
**WHEN** the administrator:
1. Selects content_type = "Markdown"
2. Fills in title, author, tags
3. Enters Markdown content in textarea
4. Optionally selects a related tool
5. Clicks "保存"

**THEN** the system should:
- Validate required fields (title, author, content)
- Insert new tutorial into Supabase with content_type='markdown'
- Show success toast "教程添加成功"
- Close modal and refresh tutorial list
- New tutorial appears in the table

**VALIDATION**:
- ✅ Markdown tutorial saved correctly
- ✅ content_md field populated
- ✅ external_url is NULL
- ✅ tool_id saved if selected

#### Scenario: Submit new URL/Video tutorial
**GIVEN** the add tutorial form is open  
**WHEN** the administrator:
1. Selects content_type = "URL" or "Video"
2. Fills in title, author, tags
3. Enters external URL
4. Clicks "保存"

**THEN** the system should:
- Validate URL format (must be valid URL)
- Insert new tutorial with content_type='url' or 'video'
- Save URL in external_url field
- Show success toast
- Refresh list

**VALIDATION**:
- ✅ URL format validated (http:// or https://)
- ✅ external_url saved correctly
- ✅ content_md is NULL

---

### Requirement: Edit Tutorial

#### Context
Administrators need to modify existing tutorials.

#### Scenario: Load edit form
**GIVEN** the administrator clicks "编辑" on a tutorial row  
**WHEN** the edit modal opens  
**THEN** the system should:
- Pre-fill all fields with existing tutorial data
- Select correct content type
- Show appropriate input (Markdown textarea or URL input)
- Load related tool if exists

**VALIDATION**:
- ✅ All fields populated correctly
- ✅ Content type matches saved value
- ✅ Conditional input shows correct content

#### Scenario: Change content type during edit
**GIVEN** editing a Markdown tutorial  
**WHEN** changing content_type to "URL"  
**THEN** the system should:
- Hide Markdown textarea
- Show URL input field
- Warn user about content loss: "切换类型将清空现有内容，确定吗?"

**VALIDATION**:
- ✅ Confirmation dialog appears
- ✅ Input area switches correctly
- ✅ Previous content preserved if confirmed

---

### Requirement: Delete Tutorial

#### Context
Administrators need to remove tutorials.

#### Scenario: Delete tutorial with confirmation
**GIVEN** the administrator clicks "删除" on a tutorial  
**WHEN** the confirmation dialog appears  
**THEN** the system should:
- Show modal: "确定删除教程 [Title]？此操作不可恢复"
- Provide "确定删除" and "取消" buttons

**WHEN** clicking "确定删除"  
**THEN**:
- Call Supabase DELETE on tutorials table
- Show success toast "教程删除成功"
- Refresh list (tutorial removed)

**VALIDATION**:
- ✅ Confirmation dialog prevents accidental deletion
- ✅ Tutorial record deleted from database
- ✅ List updates immediately

---

### Requirement: Search and Filter

#### Context
Administrators need to find specific tutorials quickly.

#### Scenario: Search by title
**GIVEN** the tutorial list is displayed  
**WHEN** entering text in search box  
**THEN** filter tutorials where title or author contains search text (case-insensitive)

**VALIDATION**:
- ✅ Real-time search with debounce (300ms)
- ✅ Search matches title and author fields

#### Scenario: Filter by content type
**GIVEN** a dropdown for content type filter  
**WHEN** selecting "Markdown" / "URL" / "Video" / "全部"  
**THEN** show only tutorials matching selected type

**VALIDATION**:
- ✅ Filter works correctly
- ✅ Shows tutorial count per type

---

## UI/UX Requirements

- Tab navigation consistent with existing "AI 工具管理" tab
- Table styling matches existing admin tool table
- Modal dialogs use existing admin.css styles
- Toast notifications for all actions (success/error)
- Loading spinner while fetching data
- Form validation with clear error messages

---

## Technical Requirements

1. **Service Key Usage**
   - Use Supabase Service Role Key for all operations
   - Bypass RLS policies (same as tool management)

2. **File Structure**
   ```
   admin.html - Add tutorial management tab
   scripts/admin-tutorials.js - Tutorial CRUD logic (new)
   styles/admin.css - Reuse existing styles
   ```

3. **Supabase Client**
   - Reuse existing `SUPABASE_CONFIG` from admin.js
   - Use same client initialization pattern

4. **Form Validation**
   - Title: Required, max 200 chars
   - Author: Required
   - URL: Must match URL pattern when type=url|video
   - Content: Required when type=markdown

---

## Dependencies

- Existing `add-admin-content-management` change (completed)
- Supabase Service Key configured
- `tutorials` table exists with extended schema

---

## Out of Scope

- Markdown WYSIWYG editor (use plain textarea)
- URL metadata auto-fetch
- Bulk operations (import/export)
- Tutorial versioning
