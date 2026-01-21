# tutorial-data Specification (Modified)

**Capability**: tutorial-data  
**Type**: Modified  
**Change**: enhance-tutorial-management  
**Builds on**: add-tutorial-sharing-feature

---

## Overview

Extends the existing `tutorials` table to support multiple content types (Markdown, external URL, video) and establishes relationships with AI tools for featured tutorial recommendations.

---

## MODIFIED Requirements

### Requirement: Store Multiple Content Types

#### Context
Currently tutorials only support Markdown content. Need to extend to support external links and videos while maintaining backward compatibility.

#### Scenario: Store Markdown tutorial
**GIVEN** a tutorial submission with type="markdown"  
**WHEN** saving to database  
**THEN** the system should:
- Set `content_type = 'markdown'`
- Store content in `content_md` field
- Set `external_url = NULL`

**VALIDATION**:
- ✅ `content_md` NOT NULL
- ✅ `external_url` IS NULL
- ✅ Existing Markdown tutorials continue working

#### Scenario: Store external URL tutorial
**GIVEN** a tutorial submission with type="url"  
**WHEN** saving to database  
**THEN** the system should:
- Set `content_type = 'url'`
- Store URL in `external_url` field
- Set `content_md = NULL`

**VALIDATION**:
- ✅ `external_url` contains valid URL
- ✅ `content_md` IS NULL
- ✅ Constraint enforces external_url presence for type='url'

#### Scenario: Store video tutorial
**GIVEN** a tutorial submission with type="video"  
**WHEN** saving to database  
**THEN** the system should:
- Set `content_type = 'video'`
- Store video URL in `external_url` field
- Set `content_md = NULL`

**VALIDATION**:
- ✅ `external_url` contains video URL (YouTube, Bilibili, etc.)
- ✅ `content_md` IS NULL

---

### Requirement: Associate Tutorial with AI Tool

#### Context
Users should be able to discover tutorials related to specific AI tools.

#### Scenario: Link tutorial to tool
**GIVEN** a tutorial about a specific AI tool  
**WHEN** creating/editing the tutorial  
**THEN** the administrator should be able to:
- Select an AI tool from dropdown
- Save tutorial with `tool_id` foreign key

**VALIDATION**:
- ✅ Foreign key constraint: `tool_id` references `ai_tools.id`
- ✅ `tool_id` can be NULL (general tutorials)
- ✅ ON DELETE SET NULL (删除工具时不删除教程)

#### Scenario: Query tutorials by tool
**GIVEN** a specific tool_id  
**WHEN** querying tutorials  
**THEN** return all tutorials where `tool_id` matches

**VALIDATION**:
- ✅ JOIN query works: `tutorials LEFT JOIN ai_tools ON tutorials.tool_id = ai_tools.id`
- ✅ Returns tool name and logo for display

---

## ADDED Requirements

### Requirement: Enforce Content Type Constraints

#### Context
Ensure data integrity for different content types.

#### Scenario: Validate type and content relationship
**GIVEN** saving a tutorial  
**WHEN** content_type is set  
**THEN** the database should enforce:

| content_type | content_md | external_url |
|--------------|------------|--------------|
| markdown     | NOT NULL   | NULL         |
| url          | NULL       | NOT NULL     |
| video        | NULL       | NOT NULL     |

**VALIDATION**:
- ✅ CHECK constraint prevents invalid combinations
- ✅ INSERT fails if constraints violated
- ✅ UPDATE fails if constraints violated

---

### Requirement: Maintain Backward Compatibility

#### Context
Existing tutorials (Markdown only) must continue working after migration.

#### Scenario: Migrate existing tutorials
**GIVEN** existing tutorials with only `content_md` populated  
**WHEN** running migration  
**THEN** the system should:
- Set `content_type = 'markdown'` for all existing rows
- Set `external_url = NULL`
- Preserve all other fields

**VALIDATION**:
- ✅ All existing tutorials have content_type='markdown'
- ✅ No data loss
- ✅ Frontend displays existing tutorials correctly

---

## Database Schema

### New Fields

```sql
content_type TEXT NOT NULL DEFAULT 'markdown'
  -- Values: 'markdown' | 'url' | 'video'
  
external_url TEXT
  -- Stores external link or video URL
  -- NULL for markdown type
  -- NOT NULL for url/video types
  
tool_id UUID
  -- Foreign key to ai_tools.id
  -- NULL for general tutorials
  -- SET NULL on tool deletion
```

### Modified Fields

```sql
content_md TEXT
  -- Changed from NOT NULL to nullable
  -- NULL when content_type != 'markdown'
```

### Constraints

```sql
-- Content type must be valid
CHECK (content_type IN ('markdown', 'url', 'video'))

-- URL required for external content
CHECK (
  (content_type = 'markdown' AND external_url IS NULL) OR
  (content_type IN ('url', 'video') AND external_url IS NOT NULL)
)

-- Markdown content required for markdown type
CHECK (
  (content_type = 'markdown' AND content_md IS NOT NULL) OR
  (content_type IN ('url', 'video') AND content_md IS NULL)
)

-- Foreign key to ai_tools
FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE SET NULL
```

### Indexes

```sql
-- Existing indexes maintained
CREATE INDEX idx_tutorials_tags ON tutorials USING GIN(tags);
CREATE INDEX idx_tutorials_created_at ON tutorials(created_at DESC);
CREATE INDEX idx_tutorials_is_featured ON tutorials(is_featured);

-- New index for tool association queries
CREATE INDEX idx_tutorials_tool_id ON tutorials(tool_id);

-- Composite index for type filtering
CREATE INDEX idx_tutorials_content_type ON tutorials(content_type);
```

---

## Migration Script

```sql
-- Step 1: Add new columns
ALTER TABLE tutorials 
  ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'markdown',
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS tool_id UUID;

-- Step 2: Make content_md nullable
ALTER TABLE tutorials 
  ALTER COLUMN content_md DROP NOT NULL;

-- Step 3: Add constraints
ALTER TABLE tutorials 
  ADD CONSTRAINT check_content_type 
    CHECK (content_type IN ('markdown', 'url', 'video'));

ALTER TABLE tutorials 
  ADD CONSTRAINT check_content_consistency 
    CHECK (
      (content_type = 'markdown' AND content_md IS NOT NULL AND external_url IS NULL) OR
      (content_type IN ('url', 'video') AND external_url IS NOT NULL AND content_md IS NULL)
    );

-- Step 4: Add foreign key
ALTER TABLE tutorials 
  ADD CONSTRAINT fk_tutorial_tool 
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE SET NULL;

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_tutorials_tool_id ON tutorials(tool_id);
CREATE INDEX IF NOT EXISTS idx_tutorials_content_type ON tutorials(content_type);

-- Step 6: Verify migration
SELECT 
  content_type,
  COUNT(*) as count,
  COUNT(content_md) as has_markdown,
  COUNT(external_url) as has_url
FROM tutorials
GROUP BY content_type;
```

---

## API Contract (Supabase Queries)

### Fetch tutorials with tool info

```javascript
const { data, error } = await supabase
  .from('tutorials')
  .select(`
    *,
    ai_tools (
      id,
      tool_name,
      tool_logo
    )
  `)
  .order('created_at', { ascending: false });
```

### Insert tutorials by type

```javascript
// Markdown tutorial
await supabase.from('tutorials').insert({
  title,
  author,
  content_type: 'markdown',
  content_md: markdownText,
  tags,
  tool_id: selectedToolId || null
});

// URL tutorial
await supabase.from('tutorials').insert({
  title,
  author,
  content_type: 'url',
  external_url: linkUrl,
  tags,
  tool_id: selectedToolId || null
});
```

---

## Dependencies

- `ai_tools` table must exist (from `add-ai-tools-gallery`)
- Supabase RLS policies maintained (public read, Service Key write)

---

## Out of Scope

- URL validation (HTTP status check)
- Video platform detection (YouTube vs Bilibili)
- Tutorial view statistics per type
- Content change history/versioning
