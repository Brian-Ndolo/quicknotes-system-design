# QuickNotes API Design

## 1. Overview

QuickNotes is a note-taking service that allows authenticated users to create, view, update, and delete notes. The API uses REST principles and JSON for request and response bodies.

**Base URL:** `https://api.quicknotes.example/v1`

**Content type:** `application/json`

**Authentication:** Protected endpoints require a valid bearer access token in the `Authorization` header.

Example:

```http
Authorization: Bearer <access_token>
```

## 2. Data conventions

- Note IDs are unique identifiers.
- Dates are returned in ISO 8601 UTC format.
- Each user can access only their own notes unless sharing is explicitly supported.
- List endpoints support pagination.
- Successful requests return JSON unless the response status is `204 No Content`.

## 3. REST endpoint reference

| Method | Path | Description | Success status |
|---|---|---|---|
| POST | `/auth/register` | Register a new user account | `201 Created` |
| POST | `/auth/login` | Authenticate a user and issue an access token | `200 OK` |
| GET | `/notes` | List the authenticated user's notes | `200 OK` |
| POST | `/notes` | Create a note | `201 Created` |
| GET | `/notes/{noteId}` | Retrieve one note by ID | `200 OK` |
| PATCH | `/notes/{noteId}` | Update selected fields of a note | `200 OK` |
| DELETE | `/notes/{noteId}` | Delete a note | `204 No Content` |
| GET | `/tags` | List the user's tags | `200 OK` |
| POST | `/notes/{noteId}/tags/{tagId}` | Associate a tag with a note | `204 No Content` |

## 4. Create a note

### Request

`POST /v1/notes`

Headers:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Body:

```json
{
  "title": "Plan the project",
  "body": "Finish the QuickNotes system design assignment."
}
```

The title is required and must contain between 1 and 100 characters after trimming whitespace. The body is optional.

### Successful response

Status: `201 Created`

```json
{
  "id": "note_1024",
  "userId": "user_12",
  "title": "Plan the project",
  "body": "Finish the QuickNotes system design assignment.",
  "createdAt": "2026-10-25T09:00:00Z",
  "updatedAt": "2026-10-25T09:00:00Z"
}
```

The server generates the note ID and timestamps; clients must not choose these values.

## 5. List notes

### Request

`GET /v1/notes?limit=10&offset=0`

Headers:

```http
Authorization: Bearer <access_token>
```

The `limit` parameter controls the maximum number of notes returned, while `offset` specifies how many matching notes to skip.

### Successful response

Status: `200 OK`

```json
{
  "data": [
    {
      "id": "note_1024",
      "userId": "user_12",
      "title": "Plan the project",
      "body": "Finish the QuickNotes system design assignment.",
      "createdAt": "2026-10-25T09:00:00Z",
      "updatedAt": "2026-10-25T09:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

An empty collection returns `200 OK` with an empty `data` array and a total of zero.

## 6. Retrieve, update, and delete notes

### Retrieve one note

`GET /v1/notes/{noteId}` returns `200 OK` and the note object when the note exists and belongs to the authenticated user.

### Update a note

`PATCH /v1/notes/{noteId}` accepts one or both of the `title` and `body` fields.

Example body:

```json
{
  "title": "Updated project plan"
}
```

The server validates the supplied fields and returns `200 OK` with the updated note.

### Delete a note

`DELETE /v1/notes/{noteId}` deletes the note owned by the authenticated user and returns `204 No Content` without a response body.

## 7. Error status codes

| Status | Meaning | Typical cause |
|---|---|---|
| `400 Bad Request` | Invalid request | Missing title, invalid JSON, or invalid pagination |
| `401 Unauthorized` | Authentication required or invalid | Missing, expired, or invalid access token |
| `403 Forbidden` | Access denied | The user lacks permission for the requested operation |
| `404 Not Found` | Resource not found | The requested note or tag does not exist or is not visible to the user |
| `409 Conflict` | Resource conflict | Duplicate email during registration |
| `422 Unprocessable Content` | Validation failed | A field fails a business rule |
| `429 Too Many Requests` | Rate limit exceeded | Too many requests in a short period |
| `500 Internal Server Error` | Unexpected server failure | An unhandled application or infrastructure error |

## 8. Example error response

Status: `400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [
      {
        "field": "title",
        "message": "Title is required and must not exceed 100 characters."
      }
    ],
    "requestId": "req_a82f91"
  }
}
```

The API should avoid exposing stack traces, database credentials, or other internal implementation details in error responses.

## 9. Security and reliability

- Require authentication for user-specific note and tag endpoints.
- Authorize every operation against the authenticated user's ownership of the resource.
- Validate request bodies and query parameters on the server.
- Use HTTPS for all client-server communication.
- Apply rate limits to reduce abuse.
- Log failures using request IDs without logging passwords or access tokens.
- Use consistent response schemas and automated API tests.

## 10. Versioning

The `/v1` prefix identifies the first public API version. Breaking changes should be introduced through a planned new version, while compatible additions can be made to the existing version.
```