# Authenticating requests

To authenticate requests, include an **`Authorization`** header with the value **`"Bearer {YOUR_BEARER_TOKEN}"`**.

All authenticated endpoints are marked with a `requires authentication` badge in the documentation below.

Obtain a token by calling <code>POST /api/v1/auth/login</code> with your email and password. Pass it as <code>Authorization: Bearer {token}</code> on all protected requests.
