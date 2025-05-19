import React, { useState } from 'react';
import { Container, Form, Button, Alert, Navbar } from 'react-bootstrap';
import { useNavigate, Link} from 'react-router-dom';
import MyNavBar from './LogInNavBar';
import MyFooter from './ MyFooterComponent';

function LogInComponent({ handleLogIn }) {
  const [credentials, setCredentials] = useState({ email: 'alice@example.com', password: 'pwd' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Update credentials as the user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // Call the parent function to log in the user.
      const user = await handleLogIn(credentials);
      console.log(user);
      // If log in is successful, navigate to the home page.
      if (user) {
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <>
    <MyNavBar/>
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '94vh' }}>
    <div style={{ flex: 1, marginTop: "10px", padding: "0 10px" }}>
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Log In</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formUsername" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Enter username"
            required
          />
        </Form.Group>
        <Form.Group controlId="formPassword" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </Form.Group>
        <div className='d-flex gap-3 '>
        <Button variant="primary" type="submit" style={{ minWidth: "100px" }}>
          Log In
        </Button>
        <Link to="/" className="btn btn-secondary" style={{ minWidth: "100px" }}>
        Back To Tickets
        </Link>
        </div>
      </Form>
    </Container>
      </div>
    <MyFooter/>
    </div>
    </>
  );
}

export default LogInComponent;
