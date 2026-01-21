# tutorial-ui Specification (Modified)

**Capability**: tutorial-ui  
**Type**: Modified  
**Change**: enhance-tutorial-management  
**Builds on**: add-tutorial-sharing-feature

---

## Overview

Adapts the existing tutorial display interface to render different content types (Markdown, external URLs, videos) and show associated AI tool information.

---

## MODIFIED Requirements

### Requirement: Display Tutorials by Content Type

#### Context
Currently tutorial UI only renders Markdown content. Need to support displaying external links and videos differently.

#### Scenario: Render Markdown tutorial card
**GIVEN** a tutorial with `content_type = 'markdown'`  
**WHEN** displaying in tutorial list  
**THEN** the card should show:
- Tutorial title, author, date
- Cover image
- Summary text
- Tags
- "阅读教程" button/link
- Content type badge: "MD"

**VALIDATION**:
- ✅ Card looks identical to existing design
- ✅ Click opens detail page with rendered Markdown

#### Scenario: Render external URL tutorial card
**GIVEN** a tutorial with `content_type = 'url'`  
**WHEN** displaying in tutorial list  
**THEN** the card should show:
- Tutorial title, author, date
- Cover image
- Summary text
- Tags
- "访问链接" button with external link icon
- Content type badge: "链接"

**WHEN** clicking  card or button  
**THEN** open `external_url` in new tab (`target="_blank" rel="noopener noreferrer"`)

**VALIDATION**:
- ✅ Button clearly indicates external link
- ✅ Opens in new tab
- ✅ No detail page for URL type

#### Scenario: Render video tutorial card
**GIVEN** a tutorial with `content_type = 'video'`  
**WHEN** displaying in tutorial list  
**THEN** the card should show:
- Tutorial title, author, date
- Cover image with play icon overlay
- Summary text
- Tags
- "观看视频" button
- Content type badge: "视频"

**WHEN** clicking card or button  
**THEN** open `external_url` in new tab

**VALIDATION**:
- ✅ Play icon clearly indicates video content
- ✅ Opens video platform in new tab

---

### Requirement: Show Associated AI Tool

#### Context
Users should see which AI tool a tutorial is related to.

#### Scenario: Display tool badge on tutorial card
**GIVEN** a tutorial with `tool_id` linked to an AI tool  
**WHEN** rendering the tutorial card  
**THEN** display a tool badge showing:
- Tool logo (small icon)
- Tool name
- Badge style: subtle background, rounded

**VALIDATION**:
- ✅ Tool badge appears on linked tutorials
- ✅ No badge on general tutorials (tool_id = NULL)
- ✅ Clicking badge filters to tool-related tutorials (future enhancement)

#### Scenario: Load tool info with tutorial
**GIVEN** fetching tutorials from Supabase  
**WHEN** querying  
**THEN** use JOIN to get tool data:

```javascript
const { data } = await supabase
  .from('tutorials')
  .select('*, ai_tools(tool_name, tool_logo)')
  .order('created_at', { ascending: false });
```

**VALIDATION**:
- ✅ Single query gets both tutorial and tool data
- ✅ NULL handling for tutorials without tool_id

---

## ADDED Requirements

### Requirement: Content Type Indicator

#### Context
Users should quickly identify tutorial type before clicking.

#### Scenario: Display content type badge
**GIVEN** any tutorial card  
**WHEN** rendering  
**THEN** show a small badge indicating type:

| Type | Badge Text | Icon | Color |
|------|------------|------|-------|
| markdown | MD | 📄 | Blue |
| url | 链接 | 🔗 | Green |
| video | 视频 | ▶️ | Red |

**VALIDATION**:
- ✅ Badge positioned consistently (e.g., top-right of cover image)
- ✅ Accessible (text + icon)

---

### Requirement: Handle External Navigation

#### Context
External links and videos should open safely in new tabs.

#### Scenario: Open external URL safely
**GIVEN** clicking an external URL or video tutorial  
**WHEN** navigation occurs  
**THEN** the link should:
- Open in new tab/window (`target="_blank"`)
- Include security attributes (`rel="noopener noreferrer"`)
- Show external link icon to indicate leaving site

**VALIDATION**:
- ✅ Security: `rel="noopener noreferrer"` prevents reverse tabnapping
- ✅ UX: Clear indication of external navigation

---

## UI Components

### Tutorial Card (Enhanced)

```html
<div class="tutorial-card" data-type="url">
  <!-- Content Type Badge -->
  <span class="content-type-badge url">🔗 链接</span>
  
  <!-- Cover Image -->
  <div class="tutorial-image-container">
    <img src="cover_image" alt="title" />
    <!-- Optional Play Icon for videos -->
    <div class="play-icon" *ngIf="type==='video'">▶️</div>
  </div>
  
  <!-- Card Content -->
  <div class="tutorial-card-content">
    <h3>{{ title }}</h3>
    <p>{{ summary }}</p>
    
    <!-- Tool Badge (if associated) -->
    <div class="tool-badge" *ngIf="tool_id">
      <img src="{{ tool_logo }}" />
      <span>{{ tool_name }}</span>
    </div>
    
    <!-- Tags -->
    <div class="tags">
      <span class="tag" *ngFor="tag">{{ tag }}</span>
    </div>
    
    <!-- Action Button -->
    <button class="btn-action" data-url="external_url">
      {{ type === 'markdown' ? '阅读教程' : 
         type === 'url' ? '访问链接' : 
         '观看视频' }}
    </button>
  </div>
</div>
```

### Detail Page Routing

```javascript
function showTutorialDetail(tutorial) {
  if (tutorial.content_type === 'markdown') {
    // Render Markdown content (existing logic)
    renderMarkdownDetail(tutorial);
  } else {
    // Redirect to external URL
    window.open(tutorial.external_url, '_blank', 'noopener,noreferrer');
  }
}
```

---

## CSS Styling

### Content Type Badges

```css
.content-type-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.content-type-badge.markdown {
  background: rgba(59, 130, 246, 0.9);
  color: white;
}

.content-type-badge.url {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.content-type-badge.video {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}
```

### Tool Badge

```css
.tool-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 999px;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.tool-badge img {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}
```

### Play Icon Overlay (for videos)

```css
.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  backdrop-filter: blur(4px);
}
```

---

## JavaScript Logic

### Type-based Rendering

```javascript
function renderTutorialCard(tutorial) {
  const isMarkdown = tutorial.content_type === 'markdown';
  const isUrl = tutorial.content_type === 'url';
  const isVideo = tutorial.content_type === 'video';
  
  const actionText = isMarkdown ? '阅读教程' :
                     isUrl ? '访问链接' :
                     '观看视频';
  
  const badgeText = isMarkdown ? '📄 MD' :
                    isUrl ? '🔗 链接' :
                    '▶️ 视频';
  
  return `
    <div class="tutorial-card" onclick="handleTutorialClick('${tutorial.id}', '${tutorial.content_type}', '${tutorial.external_url || ''}')">
      <span class="content-type-badge ${tutorial.content_type}">${badgeText}</span>
      <!-- ... card content ... -->
      <button class="btn-action">${actionText}</button>
    </div>
  `;
}

function handleTutorialClick(id, type, url) {
  if (type === 'markdown') {
    showTutorialDetail(id);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
```

---

## Dependencies

- Existing `tutorials.js` file (from add-tutorial-sharing-feature)
- `marked.js` library (for Markdown rendering)
- Supabase JOIN queries (tutorials + ai_tools)

---

## Out of Scope

- Video embedding (iframe players)
- URL metadata preview (Open Graph)
- Click tracking per type
- Related tutorials recommendation
