import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ticketIcon from '/support-ticket.svg'

function MyNavBar({ user, handleLogOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <img src={ticketIcon} alt="Ticket Icon" width="24" height="24" />
          Ticketing System</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto">
            {<Nav.Link as={Link} to="/">Tickets</Nav.Link>}
            {(user && location.pathname !== '/new')? <Nav.Link as={Link} to="/new">Create Ticket</Nav.Link> : (null)}  
          </Nav>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span>  Logged in as{user.is_admin ? <><b> Admin:</b > <i>{user.name}</i> </>: <i> : {user.name}</i> }</span>
              <Button
                variant="warning"
                onClick={() => {
                  handleLogOut();
                  navigate("/login");
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="primary" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavBar;
