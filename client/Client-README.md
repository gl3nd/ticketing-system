## Client-Side

### Routes
- **/**: Home page showing a list of all tickets (displaying title, timestamp, owner, category, and state).
- **/new**: New Ticket page for authenticated users to submit a ticket (includes a form and confirmation page).
- **/login**: Login page for users to authenticate into the system.
- A dedicated ticket details route (e.g., `/ticket/:id`) is implemented separately from list expansion for debuging reasons.

### Main React Components
- **App**: The root component that sets up routing and global context.
- **Layout**: Wraps the Navbar and Footer around child routes, providing a consistent structure.
- **MyNavBar**: The navigation bar component that presents routes (Tickets, Create Ticket, Login/Logout) based on user status.
- **TicketList**: Displays the list of tickets and manages expanding tickets to view full details including text blocks.
- **TicketForm**: Provides the form for creating a new ticket along with a read-only confirmation screen before submission.
- **LoginForm**: Handles user login by capturing credentials and interacting with the authentication API.
- **MyFooter**: The footer component displayed across all pages.
