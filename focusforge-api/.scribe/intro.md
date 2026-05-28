# Introduction

REST API for FocusForge AI — an AI-powered productivity and study companion. All endpoints (except auth) require a Bearer token obtained from /api/v1/auth/login.

<aside>
    <strong>Base URL</strong>: <code>http://localhost:8000</code>
</aside>

    Welcome to the FocusForge AI API documentation.

    **Base URL:** `http://localhost:8000/api/v1`

    **Authentication:** All protected endpoints require a `Bearer` token in the `Authorization` header.
    Obtain a token by calling `POST /api/v1/auth/login`.

    **Admin endpoints** (`/api/v1/admin/*`) additionally require the authenticated user to have the `admin` role.

    <aside>Use the tabs on the right to switch between code examples in different languages. A Postman collection and OpenAPI spec are also available via the links at the top.</aside>

