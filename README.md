# QuickNotes System Design

## Overview

QuickNotes is a note-taking application designed to help users create, organize, search, update, and delete personal notes.

This repository documents the proposed API, relational database model, and scalable system architecture for QuickNotes. It is a system design project, so the architecture and API specifications describe a proposed service rather than a fully deployed production backend.

## Project Documents

- [API Design](docs/api-design.md) — REST endpoints, request and response formats, error handling, security, and versioning.
- [Data Model](docs/data-model.md) — Database entities, relationships, SQL schema, queries, indexes, and the SQL versus NoSQL decision.
- [System Architecture](docs/architecture.md) — Architecture diagram, capacity estimates, request flows, scaling strategies, and trade-offs.

## How to Run the Client

The frontend client uses HTML, CSS, and JavaScript and calls the JSONPlaceholder public API for demonstration purposes.

### Prerequisites

- A modern web browser.
- An internet connection to access JSONPlaceholder.
- Optional: Visual Studio Code with the Live Server extension.

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Brian-Ndolo/quicknotes-system-design.git
   ```

2. Enter the project directory:

   ```bash
   cd quicknotes-system-design
   ```

3. Open `index.html` in a browser.

   Alternatively, open the project in Visual Studio Code, install the Live Server extension if needed, and use **Open with Live Server** on `index.html`.

No backend server or package installation is required for this demonstration client.

### Important Note

The client uses JSONPlaceholder, a public testing API. Creating and deleting posts are simulated operations; changes are not permanently stored. The client is a demonstration and is separate from the proposed production API documented in this repository.

## Technologies

- HTML5
- CSS3
- JavaScript
- Fetch API
- JSONPlaceholder
- Markdown
- Git and GitHub
- PostgreSQL for the proposed data model

## What I Learned

- How to design REST API endpoints using HTTP methods, status codes, request bodies, and consistent error responses.
- How to model relational data using primary keys, foreign keys, constraints, and many-to-many relationships.
- How to write SQL queries involving filtering, joins, aggregation, and indexing.
- How to plan a scalable architecture using load balancing, caching, database replicas, and background workers.
- How to estimate request traffic and storage needs using explicit assumptions.
- How to document design decisions, explain trade-offs, and track work with meaningful Git commits.

## Repository Structure

```text
quicknotes-system-design/
├── index.html
├── api.js
├── style.css
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## Author

Brian Ndolo

GitHub: [Brian-Ndolo](https://github.com/Brian-Ndolo)