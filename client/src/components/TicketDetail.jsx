// TicketDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import dayjs from 'dayjs';
import API from '../API';

function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [textBlocks, setTextBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to render HTML content with newlines preserved.
  const renderTextBlock = (content) => (
    <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }} />    
  );

  // Fetch ticket details and text blocks on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve ticket info from the tickets table
        const ticketData = await API.getTicket(id);
        // Retrieve all text blocks for this ticket
        const blocks = await API.getTicketTextBlocks(id);
        setTicket(ticketData);
        setTextBlocks(blocks);
      } catch (err) {
        console.error("Error fetching ticket data:", err);
        setError("Failed to load ticket data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Container className="mt-3">
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-3">
        <p className="text-danger">{error}</p>
        <Link to="/">Go back</Link>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container className="mt-3">
        <h2>Ticket not found</h2>
        <Link to="/">Go back</Link>
      </Container>
    );
  }

  return (
    <Container className="mt-3">
      <h1>{ticket.title}</h1>
      <p>
        <strong>Owner:</strong> {ticket.owner_name}
      </p>
      <p>
        <strong>Category:</strong> {ticket.category}
      </p>
      <p>
        <strong>State:</strong> {ticket.state}
      </p>
      <p>
        <strong>Created At:</strong> {dayjs(ticket.created_at).format('YYYY-MM-DD HH:mm:ss')}
      </p>
      <hr />
      {textBlocks.length > 0 && (
        <>
          <h4>Additional Information</h4>
          {textBlocks.map((block, index) => (
            <Card key={index} className="mb-2">
              <Card.Header>
                <small>
                  {dayjs(block.created_at).format('YYYY-MM-DD HH:mm:ss')} by user { block.author_name || block.author_id}
                </small>
              </Card.Header>
              <Card.Body>
                {renderTextBlock(block.content)}
              </Card.Body>
            </Card>
          ))}
        </>
      )}
      <Link to="/" className="btn btn-secondary mt-3">
        Back to Tickets
      </Link>
    </Container>
  );
}

export default TicketDetails;
