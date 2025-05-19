-- ---------------------------------------------------------
-- Create the "users" table with auto-incrementing id
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  salt TEXT NOT NULL,
  hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT 0
);

-- Create the "tickets" table with auto-incrementing id
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  state VARCHAR(10) CHECK (state IN ('open', 'closed')),
  category VARCHAR(50) CHECK (category IN ('inquiry', 'maintenance', 'new feature', 'administrative', 'payment')),
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Create the "ticket_text_blocks" table with auto-incrementing id
CREATE TABLE IF NOT EXISTS ticket_text_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  content TEXT NOT NULL,  -- can contain HTML tags (<b>, <i>) and newlines (\n)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- ---------------------------------------------------------
-- Insert sample users (Five users; at least two administrators)
INSERT INTO users (name, email, salt, hash, is_admin) VALUES 
  ('Alice', 'alice@example.com', '939c1e847ce49a912a4844dc379381f872a60d08f23c52a3b07d4c549d8c9b9c', '8e6fdc4219f420c66a673fa5b9d0edea', 1),
  ('Bob', 'bob@example.com', 'f92c911e007ed286f6044b00cb3b809610997406532ff8267a072c8ddd4f78a4', 'bd519a832497a994c5d658684497fa3f', 0),
  ('Charlie', 'charlie@example.com', 'a19625abfb248fd2071fcfbf7b18c09b39001b5c58ce2fc8876666daa5f035be', '4aeb0974a98d6d1829897bf921dc68e9', 1),
  ('David', 'david@example.com', '4151029f336d5cd48bbe2a2a816ed046bf8d6f2be9a9d3a1e703ba9072419ceb', '8d327346dfef9255f075a866d492f5ae', 0),
  ('Eve', 'eve@example.com', '9c357642addc515b1e346943414f1c6bc524665e3f218b0207df7a738a8670ac', '9ffad9953c9ffc27e70e93e3ccc11499', 0);

-- ---------------------------------------------------------
-- Insert sample tickets.
-- Three users (Alice, Bob, Charlie) have at least one open and one closed ticket.
-- Each ticket uses a different category as required.

-- Ticket 1: Owner - Alice (admin), open, category: inquiry.
INSERT INTO tickets (owner_id, owner_name, state, category, title) VALUES 
  (1, 'Alice', 'open', 'inquiry', 'Issue logging in');

-- Ticket 2: Owner - Alice (admin), closed, category: new feature.
INSERT INTO tickets (owner_id, owner_name, state, category, title) VALUES 
  (1, 'Alice', 'closed', 'new feature', 'Feature request: Dark Mode');

-- Ticket 3: Owner - Bob, open, category: payment.
INSERT INTO tickets (owner_id, owner_name, state, category, title) VALUES 
  (2, 'Bob', 'open', 'payment', 'Payment gateway error');

-- Ticket 4: Owner - Bob, closed, category: maintenance.
INSERT INTO tickets (owner_id, owner_name, state, category, title) VALUES 
  (2, 'Bob', 'closed', 'maintenance', 'Server maintenance update');

-- Ticket 5: Owner - Charlie (admin), open, category: administrative.
INSERT INTO tickets (owner_id, owner_name, state, category, title) VALUES 
  (3, 'Charlie', 'open', 'administrative', 'Admin panel bug');

-- Ticket 6: Owner - Charlie (admin), closed, category: inquiry.
INSERT INTO tickets (owner_id, owner_name, state, category, title) VALUES 
  (3, 'Charlie', 'closed', 'inquiry', 'Inquiry about usage limits');
-- Ticket 7: Owned by David (non-admin), open, administrative.
INSERT INTO tickets (owner_id, owner_name, state, category, title) VALUES 
  (4, 'David', 'open', 'administrative', 'Issue accessing network settings');

-- Ticket 8: Owned by Eve (non-admin), open, maintenance.
INSERT INTO tickets (owner_id, owner_name, state, category, title) VALUES 
  (5, 'Eve', 'open', 'maintenance', 'Broken Office Printer');

-- Ticket 9: Owned by Eve (non-admin), closed, payment.
INSERT INTO tickets (owner_id, owner_name, state, category, title) VALUES 
  (5, 'Eve', 'closed', 'payment', 'Payment discrepancy on invoice');

-- Ticket 10: Owned by David (non-admin), closed, new feature.
INSERT INTO tickets (owner_id, owner_name, state, category, title) VALUES 
  (4, 'David', 'closed', 'new feature', 'Request: Mobile App for Ticketing System');

-- ---------------------------------------------------------
-- Insert sample ticket text blocks.
-- Ticket 1: Only the initial text block (by owner, Alice).
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
(1, 1, 'I am unable to log in to my account. Please <b>review</b> my credentials and <i>assist</i> me.
I have tried resetting the password.');

-- Ticket 2: Three blocks; at least one block by a different author.
-- Block 1: Initial block by owner (Alice)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
(2, 1, 'I would like to have a <b>dark mode</b> feature for better readability.
It would help in low-light conditions.');
-- Block 2: Response by Bob (different from owner)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
(2, 2, 'I second this request. <i>Dark mode</i> would benefit our team.
Let’s prioritize this enhancement.');
-- Block 3: Follow-up by owner (Alice)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
(2, 1, 'Looking forward to an update on this <b><i>important</i></b> enhancement.
Thank you.');

-- Ticket 3: Only the initial block (by owner Bob).
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
(3, 2, 'Encountered an error processing the payment.
The <b>transaction</b> was declined unexpectedly.');

-- Ticket 4: Three blocks; at least one block by an author different from the owner.
-- Block 1: Initial block by owner (Bob)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
(4, 2, 'We scheduled regular server maintenance last Friday.
No issues were noted initially.');
-- Block 2: Additional block by owner (Bob)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
(4, 2, 'However, subsequent <i>updates</i> revealed moderate performance issues.
Monitoring is ongoing.');
-- Block 3: Additional block by Charlie (different from owner)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
(4, 3, 'Please review the server logs and <b>prioritize</b> critical fixes.
Immediate action is needed.');

-- Ticket 5: Only the initial block (by owner Charlie).
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
(5, 3, 'There is a bug in the admin panel which prevents <i>access</i> to user controls.
Immediate attention is required.');

-- Ticket 6: Only the initial block (by owner Charlie).
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
(6, 3, 'I have a question regarding the usage limits.
Could you please <b>explain</b> the policy?');
-- Ticket 7 text blocks:
-- Block 1: Initial text block by owner (David)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
  (7, 4, 'I am unable to access my network settings. The system reports "Permission Denied". Please assist.');
-- Block 2: Response by an admin (Alice)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
  (7, 1, 'Please contact IT support; your account permissions are being reviewed.');

-- Ticket 8 text blocks:
-- Block 1: Initial text block by owner (Eve)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
  (8, 5, 'Our office printer is not printing for multiple users. It may need a repair or replacement.');
-- Block 2: Follow-up response by Bob
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
  (8, 2, 'I have seen similar issues; it could be a connectivity problem.');

-- Ticket 9 text blocks:
-- Block 1: Initial text block by owner (Eve)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
  (9, 5, 'There appears to be an extra charge on my latest invoice. Please check the billing details.');
-- Block 2: Response by admin (Alice)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
  (9, 1, 'We reviewed your invoice and will correct the error in the next billing cycle.');

-- Ticket 10 text blocks:
-- Block 1: Initial text block by owner (David)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
  (10, 4, 'It would be great to have a mobile app version of this ticketing system.');
-- Block 2: Follow-up response by admin (Charlie)
INSERT INTO ticket_text_blocks (ticket_id, author_id, content) VALUES 
  (10, 3, 'This feature is under review and may be implemented in a future update.');

