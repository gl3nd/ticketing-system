// TicketForm.js
import React, { useState } from 'react';
import { Container, Form, Button, Card,Row,Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import dayjs from 'dayjs';


function TicketForm( {user, setDirty} ) {
  const navigate = useNavigate();
  //console.log(user);
  const [formData, setFormData] = useState({
    owner: user.name,
    title: '',
    category: 'inquiry',
    description: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  
  const categories = ["Inquiry", "Maintenance", "New feature", "Administrative", "Payment"];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare ticket data; use current timestamp.
      const ticketData = {
        owner: formData.owner, // already known from user.name
        title: formData.title,
        category: formData.category.toLowerCase(),  // or leave it as is if expected format matches
        state: 'open',  // assuming new tickets are open by default
        timeStamp: dayjs().toISOString()
      };  
      setTicketData(ticketData);
      setShowConfirmation(true);
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError("Failed to create ticket. Please try again.");
    }
  }
  const handleConfirmSubmit = async () => {
    try {
      // Step 1: Create a new ticket in the tickets table.
      const newTicket = await API.createTicket(ticketData);
      console.log("New Ticket Created:", newTicket);
  
      // Step 2: Create an initial text block for the ticket description.
      const textBlockData = {
        ticket_id: newTicket.id,
        author_id: user.id,
        content: formData.description.trim(),
        created_at: newTicket.timeStamp
      };
      console.log("Submitting text block:", textBlockData);
      await API.createTextBlock(textBlockData);
  
      console.log("Ticket successfully created!");
      setDirty(true);
      navigate("/");
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError("Failed to create ticket. Please try again.");
    }
  };
  
  
  return (
    <Container className="mt-3">
      <h1>{showConfirmation ? "Confirm Ticket Submission" : "Create New Ticket"}</h1>
  
      {showConfirmation ? (
        // Confirmation Page Before Sending Data to Server
        <Container className="mt-3">
      <Card>
        <Card.Header as="h5">Ticket</Card.Header>
        <Card.Body>
          <Row className="mb-2">
            <Col xs={4}><strong>Owner:</strong></Col>
            <Col xs={8}>{ticketData.owner}</Col>
          </Row>  
          <Row className="mb-2">
            <Col xs={4}><strong>Title:</strong></Col>
            <Col xs={8}>{ticketData.title}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={4}><strong>Category:</strong></Col>
            <Col xs={8}>{ticketData.category}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={4}><strong>State:</strong></Col>
            <Col xs={8}>{ticketData.state}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={4}><strong>Created At:</strong></Col>
            <Col xs={8}>{dayjs(ticketData.timeStamp).format('YYYY-MM-DD HH:mm:ss')}</Col>
          </Row>
          <Row className="mb-3">
            <Col xs={4}><strong>Description:</strong></Col>
            <Col xs={8}>{formData.description}</Col>
          </Row>
          <div className="d-flex gap-3">
            <Button variant="success" onClick={handleConfirmSubmit}>
              Confirm Submission
            </Button>
            <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
              Edit Ticket
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
      ) : (
        // Form for Creating a Ticket
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Owner</Form.Label>
            <Form.Control type="text" name="owner" defaultValue={formData.owner} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select name="category" value={formData.category} onChange={handleChange}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={5} name="description" value={formData.description} onChange={handleChange} required />
          </Form.Group>
          <Button variant="success" type="submit">Submit Ticket</Button>
        </Form>
      )}
    </Container>
  );
  
}
export default TicketForm;
