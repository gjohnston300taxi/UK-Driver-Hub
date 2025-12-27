# Social Feed MVP Implementation

## Overview
A LinkedIn-style driver feed for authenticated users, built with Next.js App Router, Supabase, and shadcn/ui.

**URL:** `/feed`

## Features
- ✅ LinkedIn-style post feed with real-time interactions
- ✅ Post composer with content (max 1000 chars) and optional link
- ✅ Like/unlike posts with optimistic UI updates
- ✅ Comment on posts with expandable comment sections
- ✅ Region filtering (All UK / My Region)
- ✅ Taxi-yellow accents for primary actions
- ✅ Full RLS (Row-Level Security) with Supabase
- ✅ Server-side rendering with Next.js App Router
- ✅ Responsive design with shadcn/ui components

## Architecture

### Route Structure
```
app/feed/
├── page.tsx          # Main feed page (Server Component)
├── actions.ts        # Server actions for posts, likes, comments
```

### Components
```
components/feed/
├── FeedClient.tsx    # Client wrapper with region filter tabs
├── PostComposer.tsx  # Post creation form
├── PostList.tsx      # List of posts
├── PostCard.tsx      # Individual post with author info
├── LikeButton.tsx    # Like/unlike button with count
├── CommentList.tsx   # Comments section with add comment form
```

### UI Components (shadcn/ui)
```
components/ui/
├── card.tsx         # Post cards
├── button.tsx       # Action buttons
├── input.tsx        # Comment input
├── textarea.tsx     # Post content input
├── separator.tsx    # Visual separators
├── tabs.tsx         # Region filter tabs
```

## Database Schema

### Tables

#### `profiles` (assumed existing)
```sql
- id: UUID (PK, references auth.users)
- email: TEXT
- name: TEXT
- region: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `posts`
```sql
- id: UUID (PK)
- author_id: UUID (FK -> profiles.id)
- content: TEXT (max 1000 chars)
- link_url: TEXT (nullable)
- region: TEXT (nullable, copied from author)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Indexes:**
- `posts_created_at_idx` - For sorting by date
- `posts_region_idx` - For region filtering
- `posts_author_id_idx` - For author lookups

**RLS Policies:**
- ✅ Authenticated users can read all posts
- ✅ Users can insert/update/delete their own posts

#### `post_likes`
```sql
- id: UUID (PK)
- post_id: UUID (FK -> posts.id, CASCADE)
- user_id: UUID (FK -> profiles.id, CASCADE)
- created_at: TIMESTAMPTZ
- UNIQUE(post_id, user_id) - Prevent duplicate likes
```

**Indexes:**
- `post_likes_post_id_idx` - For counting likes
- `post_likes_user_id_idx` - For user like lookups

**RLS Policies:**
- ✅ Authenticated users can read all likes
- ✅ Users can insert/delete their own likes

#### `post_comments`
```sql
- id: UUID (PK)
- post_id: UUID (FK -> posts.id, CASCADE)
- author_id: UUID (FK -> profiles.id, CASCADE)
- content: TEXT (max 500 chars)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Indexes:**
- `post_comments_post_id_idx` - For loading comments
- `post_comments_created_at_idx` - For sorting
- `post_comments_author_id_idx` - For author lookups

**RLS Policies:**
- ✅ Authenticated users can read all comments
- ✅ Users can insert/update/delete their own comments

### Migrations
The complete database schema with RLS policies is in:
```
supabase/migrations/feed_schema.sql
```

To apply the schema to your Supabase project:
```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase Dashboard > SQL Editor
```

## Data Flow

### Creating a Post
1. User types content in PostComposer
2. Optionally adds a link URL
3. Submits form → calls `createPost()` server action
4. Server action:
   - Validates content (1-1000 chars)
   - Gets user's region from profile
   - Inserts post with `author_id = auth.uid()` and user's region
   - Revalidates `/feed` path
5. Feed refreshes automatically

### Liking a Post
1. User clicks heart icon on LikeButton
2. Optimistic UI update (instant feedback)
3. Calls `toggleLike()` server action
4. Server action:
   - Checks if user already liked the post
   - If liked: DELETE the like (unlike)
   - If not liked: INSERT a new like
   - Revalidates `/feed` path
5. On error, reverts optimistic update

### Adding a Comment
1. User types comment and clicks "Post"
2. Calls `addComment()` server action
3. Server action:
   - Validates content (1-500 chars)
   - Inserts comment with `author_id = auth.uid()`
   - Revalidates `/feed` path
4. Comments reload to show new comment

### Region Filtering
1. User toggles between "All UK" and "My Region" tabs
2. FeedClient calls `getPosts(regionFilter)` server action
3. Server action:
   - If "My Region": filters posts where `region = user.region OR region IS NULL`
   - If "All UK": returns all posts
   - Orders by `created_at DESC` (newest first)
4. PostList re-renders with filtered posts

**Design decision:** Posts with `region = null` are shown in all filters. This allows posts to be visible across regions if needed.

## Authentication & Authorization

### Route Protection
```typescript
// app/feed/page.tsx
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/signin')
```

### Profile Check
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('name, region')
  .eq('id', user.id)
  .single()

if (!profile || !profile.name) redirect('/onboarding')
```

### RLS Security
- All database operations use the **anon key** (not service_role)
- RLS policies enforce `auth.uid()` checks
- Users can only modify their own content
- All reads require authentication

## Styling

### Taxi-Yellow Theme
The primary color is already defined in `tailwind.config.ts`:
```typescript
colors: {
  'taxi-yellow': '#FFC400',
}
```

**Usage:**
- Post button: `bg-taxi-yellow hover:bg-taxi-yellow/90 text-black`
- Comment button: `bg-taxi-yellow hover:bg-taxi-yellow/90 text-black`
- Liked state: `text-taxi-yellow`
- Links: `text-taxi-yellow hover:underline`

### Responsive Design
- Max width: `max-w-2xl` (centered feed)
- Padding: `py-8 px-4`
- Mobile-friendly card layouts
- Touch-optimized buttons

## Error Handling

### Authentication Errors
- Not logged in → Redirect to `/signin`
- No profile → Redirect to `/onboarding`

### Data Errors
- Post too long → Show error message (1000 char limit)
- Comment too long → Show error message (500 char limit)
- Empty content → Disable submit button
- Network errors → Show user-friendly error in red banner

### Optimistic UI
- Likes update immediately, revert on error
- Comments show after successful insertion
- Post composer clears only after successful creation

## TypeScript Types

### Database Types
Location: `lib/database.types.ts`

```typescript
- Database - Full database schema
- Profile - User profile row
- Post - Post row
- PostLike - Like row
- PostComment - Comment row
- PostWithAuthor - Post with joined author data, counts, and user state
- CommentWithAuthor - Comment with joined author data
```

## Files Created/Modified

### New Files
1. `app/feed/page.tsx` - Main feed route
2. `app/feed/actions.ts` - Server actions
3. `components/feed/FeedClient.tsx` - Client wrapper
4. `components/feed/PostComposer.tsx` - Post creation
5. `components/feed/PostList.tsx` - Posts display
6. `components/feed/PostCard.tsx` - Individual post
7. `components/feed/LikeButton.tsx` - Like interaction
8. `components/feed/CommentList.tsx` - Comments section
9. `components/ui/card.tsx` - Card component
10. `components/ui/input.tsx` - Input component
11. `components/ui/textarea.tsx` - Textarea component
12. `components/ui/separator.tsx` - Separator component
13. `components/ui/tabs.tsx` - Tabs component
14. `lib/database.types.ts` - Database type definitions
15. `supabase/migrations/feed_schema.sql` - Database schema

### Dependencies Added
```json
{
  "@radix-ui/react-separator": "^1.1.0",
  "@radix-ui/react-tabs": "^1.1.0"
}
```

## Next Steps

### Database Setup
1. Apply the migration SQL to your Supabase project
2. Ensure the `profiles` table exists with required columns
3. Verify RLS policies are enabled

### Testing Checklist
- [ ] Can create a post with content only
- [ ] Can create a post with content + link
- [ ] Can like/unlike a post
- [ ] Like count updates correctly
- [ ] Can add comments
- [ ] Comments appear after posting
- [ ] Region filter works (All UK / My Region)
- [ ] Posts sorted by newest first
- [ ] Redirect to /signin when not authenticated
- [ ] Redirect to /onboarding if profile incomplete
- [ ] Character limits enforced (1000 for posts, 500 for comments)
- [ ] Empty posts cannot be submitted
- [ ] Taxi-yellow styling on buttons and active states

### Future Enhancements
- [ ] Real-time updates with Supabase Realtime
- [ ] Image uploads for posts
- [ ] Mentions and hashtags
- [ ] Notifications for likes/comments
- [ ] Post editing/deletion UI
- [ ] Comment editing/deletion UI
- [ ] Share posts
- [ ] Pagination for large feeds
- [ ] Search posts

## Security Considerations

✅ **RLS Enabled:** All tables use Row-Level Security
✅ **No Service Role Key:** All operations use anon key with RLS
✅ **Auth Checks:** Server components verify authentication
✅ **Input Validation:** Content length limits enforced
✅ **XSS Protection:** React escapes all user content by default
✅ **CSRF Protection:** Next.js handles this automatically
✅ **SQL Injection:** Prevented by Supabase parameterized queries

## Performance

- **Server Components:** Initial data loaded server-side
- **Optimistic Updates:** Instant feedback for likes
- **Indexed Queries:** All common queries use database indexes
- **Client-Side Filtering:** Region filter avoids full page reload
- **Revalidation:** Smart path revalidation after mutations

## Accessibility

- Semantic HTML with proper heading hierarchy
- Keyboard navigation supported
- Screen reader friendly with ARIA labels
- Focus states on interactive elements
- Color contrast meets WCAG standards
