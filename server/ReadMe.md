# Ticketing System Backend

## Server-Side HTTP APIs

- **GET /api/tickets:**  
  Returns all tickets (fields: title, created_at, owner, category, and state). No parameters required.

- **GET /api/tickets/:id:**  
  Returns detailed ticket info; requires authentication. Parameter: `id` (ticket identifier).

- **POST /api/tickets:**  
  Creates a new ticket. Expects JSON with `{ state, category, title, timeStamp }`; owner is set from the session.

- **PUT /api/tickets/:id:**  
  Updates ticket state or category. Expects JSON with `{ state, category }`; parameter: `id`.

- **POST /api/tickets/:id/textblocks:**  
  Adds a new text block to a ticket. Expects JSON with `{ content }`; author is set from the session.

- **GET /api/tickets/:id/textblocks:**  
  Retrieves all text blocks for the specified ticket; parameter: `id`.

- **POST /api/sessions:**  
  Authenticates a user. Expects `{ email, password }` in the JSON payload; returns a user object on success.

- **GET /api/sessions/current:**  
  Returns the current authenticated user object, or an error if not logged in.

- **DELETE /api/sessions/current:**  
  Logs out the current user; no payload required.

## Database Tables

- **users:**  
  *Purpose:* Stores user credentials and roles.  
  *Columns:* `id` (Primary key), `name`, `email`, `salt`, `hash`, `is_admin`.

- **tickets:**  
  *Purpose:* Stores tickets with meta-data.  
  *Columns:* `id` (Primary key), `owner_id`, `owner_name`, `state`, `category`, `title`, `created_at`.

- **ticket_text_blocks:**  
  *Purpose:* Stores the initial and additional text blocks per ticket.  
  *Columns:* `id` (Primary key), `ticket_id`, `author_id`, `content`, `created_at`.
