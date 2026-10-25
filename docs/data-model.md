# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database to store user accounts, notes, and tags. The database maintains relationships between these entities using primary keys and foreign keys.

The proposed database is PostgreSQL.

## 2. Entities and relationships

### Users

Stores account information for people using QuickNotes.

- `id`: Unique user identifier.
- `name`: User's display name.
- `email`: User's unique email address.
- `password_hash`: Securely hashed password.
- `created_at`: Account creation timestamp.

### Notes

Stores notes created by users.

- `id`: Unique note identifier.
- `user_id`: The user who owns the note.
- `title`: Note title, required and limited to 100 characters.
- `body`: Note content, which may be empty.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

### Tags

Stores labels that users can apply to their notes.

- `id`: Unique tag identifier.
- `user_id`: The user who owns the tag.
- `name`: Tag name, unique for each user.
- `created_at`: Tag creation timestamp.

### Note_tags

Connects notes and tags.

- `note_id`: The associated note.
- `tag_id`: The associated tag.

This junction table supports a many-to-many relationship: a note can have several tags, and a tag can be attached to several notes.

## 3. Entity relationships

- One user can have many notes.
- One user can have many tags.
- One note can have many tags.
- One tag can belong to many notes.
- Each note belongs to one user.
- Each tag belongs to one user.

The `users` table has a one-to-many relationship with both `notes` and `tags`. The `notes` and `tags` tables have a many-to-many relationship implemented through `note_tags`.

## 4. SQL schema

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT notes_title_not_blank CHECK (LENGTH(TRIM(title)) > 0)
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_tag_per_user UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

The primary keys uniquely identify records. Foreign keys maintain referential integrity, while `ON DELETE CASCADE` removes dependent records when their parent records are deleted.

The application should update `updated_at` whenever a note changes, using application logic or a database trigger.

## 5. Example SQL queries

### Query 1: Get all notes belonging to a user

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC
LIMIT 10 OFFSET 0;
```

This query retrieves the most recently updated notes for one user. The application must obtain the user ID from the authenticated session or token, not trust an arbitrary client-supplied ID.

### Query 2: Find notes containing a keyword

```sql
SELECT id, title, body
FROM notes
WHERE user_id = 1
  AND (
    title ILIKE '%project%'
    OR body ILIKE '%project%'
  )
ORDER BY updated_at DESC;
```

This query searches note titles and bodies for a keyword without distinguishing uppercase and lowercase letters.

### Query 3: Retrieve notes with their tags

```sql
SELECT
    n.id AS note_id,
    n.title,
    t.name AS tag_name
FROM notes AS n
LEFT JOIN note_tags AS nt ON nt.note_id = n.id
LEFT JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 1
ORDER BY n.id;
```

The `LEFT JOIN` operations return notes even when they do not have any tags.

### Query 4: Count notes per user

```sql
SELECT
    u.id AS user_id,
    u.email,
    COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.email
ORDER BY note_count DESC;
```

This query demonstrates aggregation and returns the number of notes associated with each user, including users with zero notes.

## 6. Indexing strategy

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);
```

This index helps retrieve a user's most recently updated notes efficiently. It supports the filtering and sorting pattern used by the notes listing endpoint.

The foreign key on `note_tags.tag_id` may also benefit from an index when retrieving notes by tag:

```sql
CREATE INDEX idx_note_tags_tag
ON note_tags (tag_id);
```

The primary key on `(note_id, tag_id)` already supports lookups beginning with `note_id`, so a separate index on `note_id` is unnecessary for that purpose.

Indexes improve selected read operations but consume storage and add overhead to inserts, updates, and deletes. Additional indexes should be based on actual query patterns and measurements.

## 7. Why use SQL instead of NoSQL?

PostgreSQL is a suitable choice for QuickNotes because the data has clear relationships between users, notes, and tags.

- **Relationships:** Foreign keys connect notes and tags to their owners and maintain referential integrity.
- **Transactions:** Transactions help ensure that related changes succeed or fail together.
- **Constraints:** Unique constraints and validation checks protect data consistency.
- **Queries:** Joins and aggregations make it straightforward to retrieve notes with tags and generate usage statistics.
- **Structured data:** The core fields have predictable types and relationships.

A document database could also support a note-taking application, particularly if note structures varied significantly. However, PostgreSQL is a practical starting point because QuickNotes requires consistent relationships, reliable transactions, and flexible querying.

## 8. Data integrity and security

- Store password hashes, never plaintext passwords.
- Enforce ownership checks in the application for every note and tag operation.
- Use parameterized SQL queries to prevent SQL injection.
- Use transactions when multiple related database changes must succeed together.
- Back up the database and test restoration procedures.
- Apply database permissions according to the principle of least privilege.