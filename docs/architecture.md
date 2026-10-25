# QuickNotes System Architecture

## 1. Overview

QuickNotes is a web-based note-taking application that allows users to create, view, update, delete, search, and organize notes with tags.

The proposed architecture uses a browser-based client, a REST API, PostgreSQL, a cache, and a background job queue. It is designed to start simply and scale as usage grows.

## 2. Functional requirements

The system must allow users to:

- Register and log in securely.
- Create notes with a required title and optional body.
- List and search their own notes.
- Retrieve, update, and delete individual notes.
- Create tags and associate tags with notes.
- View notes in a useful order, such as most recently updated first.
- Access only resources they are authorized to use.

## 3. Non-functional requirements

- **Availability:** Keep the service available during routine server failures.
- **Performance:** Aim for a p95 response time below 300 ms for common cached reads and below 500 ms for typical database-backed reads, excluding network delays outside the service.
- **Scalability:** Support growth in concurrent users and request volume by adding application instances and database capacity.
- **Security:** Use HTTPS, secure password hashing, authenticated requests, authorization checks, and input validation.
- **Reliability:** Back up the database and test recovery procedures.
- **Maintainability:** Separate the client, API, database, and background processing responsibilities.
- **Observability:** Record structured logs, metrics, and request IDs to help diagnose failures.

These are design targets, not measured guarantees. Actual performance depends on implementation, infrastructure, and workload.

## 4. High-level architecture diagram

```text
                         +----------------------+
                         |    Web Browser       |
                         |  QuickNotes Client   |
                         +----------+-----------+
                                    |
                                  HTTPS
                                    |
                         +----------v-----------+
                         |   DNS / CDN / WAF    |
                         | DNS, static files,   |
                         | basic edge protection|
                         +----------+-----------+
                                    |
                         +----------v-----------+
                         |    Load Balancer     |
                         +-----+-----------+----+
                               |           |
                      +--------v--+     +--v---------+
                      | API Server|     | API Server |
                      | Instance A|     | Instance B|
                      +-----+-----+     +------+-----+
                            |                  |
                            +--------+---------+
                                     |
                         +-----------v----------+
                         |     Cache Layer      |
                         | Redis or equivalent  |
                         +-----------+----------+
                                     |
                         +-----------v----------+
                         |   Primary PostgreSQL |
                         |   Database           |
                         +-----------+----------+
                                     |
                         +-----------v----------+
                         |   Read Replica       |
                         +----------------------+

                  API servers also publish eligible
                  background jobs to a durable queue.
                                     |
                         +-----------v----------+
                         |   Job Queue          |
                         +-----------+----------+
                                     |
                         +-----------v----------+
                         |   Background Workers |
                         +----------------------+
```

The primary database handles writes. The read replica can serve selected read workloads after replication lag and consistency requirements are considered. The diagram is logical: production deployment details may place the cache and database behind private networking and separate security controls.

## 5. Component responsibilities

| Component | Purpose |
|---|---|
| Web browser and client | Displays the interface and sends API requests. |
| DNS | Resolves the application domain to the appropriate entry point. |
| CDN | Caches eligible static assets close to users. |
| WAF | Applies edge security rules to reduce common malicious traffic. |
| Load balancer | Distributes requests across healthy API instances. |
| API servers | Authenticate requests, authorize access, validate input, and apply business rules. |
| Cache | Stores selected frequently accessed data to reduce database load. |
| Primary PostgreSQL database | Stores authoritative user, note, and tag records and processes writes. |
| Read replica | Handles suitable read queries and reduces primary database read load. |
| Durable job queue | Holds background work until a worker processes it. |
| Background workers | Process asynchronous tasks such as notifications, exports, or other non-immediate work. |

## 6. Capacity estimates for one million users

The following are planning assumptions for a hypothetical service with one million registered users. They are not actual usage measurements.

### Assumptions

- Registered users: 1,000,000.
- Daily active users: 100,000, or 10% of registered users.
- Average requests per daily active user: 50 per day.
- Peak traffic multiplier: 5 times the average request rate.
- Average stored notes per registered user: 100.
- Average stored note content: 2 KB, excluding database overhead and indexes.

### Request volume

Daily requests:

`100,000 active users × 50 requests = 5,000,000 requests/day`

Average requests per second:

`5,000,000 ÷ 86,400 ≈ 58 requests/second`

Estimated peak requests per second:

`58 × 5 ≈ 290 requests/second`

A reasonable initial capacity test target would therefore be approximately 300 requests per second, with additional headroom for unexpected spikes. Capacity must be validated using load tests and realistic read/write mixes.

### Read and write assumptions

For an illustrative workload with 90% reads and 10% writes:

- Average reads: approximately 52 requests/second