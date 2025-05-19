import React, { useState } from 'react';
import { Container, Table, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../API';

function TicketList({ ticketList, user, setDirty }) {
  // Sort tickets so the most recent (by timestamp) is first.
  const sortedTickets = [...ticketList].sort(
    (a, b) => new Date(b.timeStamp) - new Date(a.timeStamp)
  );
  // State to store expanded ticket details.
  // Structure: { [ticketId]: [textBlock1, textBlock2, ...] }
  const [expandedTickets, setExpandedTickets] = useState({});
  const [newBlock, setNewBlock] = useState({});

  // Toggle ticket details (expand/collapse) for a given ticket id.
  const toggleTicketDetails = async (ticketId) => {
    if (expandedTickets[ticketId]) {
      // If already expanded, collapse it by removing it from state.
      setExpandedTickets((prev) => {
        const copy = { ...prev };
        delete copy[ticketId];
        return copy;
      });
    } else {
      try {
        // Fetch details via API.
        const details = await API.getTicketTextBlocks(ticketId);
        // Sort in ascending order (chronological order: oldest first).
        details.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setExpandedTickets((prev) => ({ ...prev, [ticketId]: details }));
      } catch (error) {
        console.error("Error fetching ticket details for ticket", ticketId, error);
      }
    }
  };
  const renderTextBlock = (content) => (
    <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }} />
  );
  // Handle textarea change for a specific ticket.
  const handleNewBlockChange = (ticketId, value) => {
    setNewBlock((prev) => ({ ...prev, [ticketId]: value }));
  };
  // Handle adding a new text block.
  const handleAddNewBlock = async (ticketId) => {
    const content = newBlock[ticketId]?.trim();
    if (!content) return; // Do nothing if empty.
    try {
      // Prepare new text block data.
      const blockData = {
        ticket_id: ticketId,
        author_id: user.id, // automatically assigns the current user.
        //author_name: author_name,
        content,           // text provided by the user.
      };
      // Create text block via API.
      await API.createTextBlock(blockData);

      // Re-fetch the updated list of text blocks for this ticket.
      const updatedBlocks = await API.getTicketTextBlocks(ticketId);
      // Sort updated details in chronological order (oldest first).
      updatedBlocks.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      // Update the state with the freshly retrieved blocks.
      setExpandedTickets((prev) => ({ ...prev, [ticketId]: updatedBlocks }));

      // Clear the textarea.
      setNewBlock((prev) => ({ ...prev, [ticketId]: '' }));
    } catch (error) {
      console.error("Error adding new block for ticket", ticketId, error);
    }
  };
  // Update ticket state (e.g. mark as closed or open) or category.
  const handleUpdateTicket = async (ticketId, updateData) => {
    try {
      const updatedTicket = await API.updateTicket(ticketId, updateData);
      // Update local ticket state.
      setDirty(true);
    } catch (error) {
      console.error("Error updating ticket", ticketId, error);
    }
  };


  return (
    <Container className="mt-3">
      <h1>Tickets</h1>
      <Table hover>
        <thead className="big-header">
          <tr>
            <th>Title</th>
            <th>Created At</th>
            <th>Owner</th>
            <th>Category</th>
            <th>State</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedTickets.map((ticket) => (
            <React.Fragment key={ticket.id}>
              <tr>
                <td>{ticket.title}</td>
                <td>
                  {dayjs(ticket.timeStamp).format("YYYY-MM-DD HH:mm:ss")}
                </td>
                <td>{ticket.owner_name}</td>

                {/* If user is admin, allow category changes */}
                {user && user.is_admin ? (
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "auto" }}
                      value={ticket.category}
                      onChange={(e) =>
                        handleUpdateTicket(ticket.id, {
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="inquiry">Inquiry</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="new feature">New Feature</option>
                      <option value="administrative">Administrative</option>
                      <option value="payment">Payment</option>
                    </select>
                  </td>
                ) : (
                  <td style={{ textTransform: 'capitalize' }}> {ticket.category} </td>
                )}

                <td style={{ textTransform: 'capitalize' }}>{ticket.state}</td>
                <td>
                  <div className="d-flex gap-2">
                    {/* Expand/Collapse Details */}
                    {user ? (
                      <Button
                        variant="info"
                        size="sm"
                        style={{ minWidth: "130px" }}
                        onClick={() => toggleTicketDetails(ticket.id)}
                      >
                        {expandedTickets[ticket.id]
                          ? "Collapse Details"
                          : "Expand Details"}
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" disabled>
                        View Details
                      </Button>
                    )}

                    {/* If the ticket is open */}
                    {ticket.state === "open" && user ? (
                      ticket.owner_id === user.id || user.is_admin ? (
                        // Allowed: Active "Mark as Closed" button
                        <Button
                          style={{ minWidth: "125px" }}
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleUpdateTicket(ticket.id, { state: "closed" })}
                        >
                          Mark as Closed
                        </Button>
                      ) : (
                        // Not allowed: Disabled "Mark as Closed" button for non-owner, non-admins
                        <Button
                          style={{ minWidth: "125px" }}
                          variant="outline-warning"
                          size="sm"
                          disabled
                        >
                          Mark as Closed
                        </Button>
                      )
                    ) : null}

                    {/* If the ticket is closed */}
                    {ticket.state === "closed" && user ? (
                      user.is_admin ? (
                        // Ticket is closed and user is admin: Active "Mark as Open" button
                        <Button
                          style={{ minWidth: "125px" }}
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleUpdateTicket(ticket.id, { state: "open" })}
                        >
                          Mark as Open
                        </Button>
                      ) : (
                        // Ticket is closed and user is not admin: Disabled button indicating ticket is closed
                        <Button
                          style={{ minWidth: "125px" }}
                          variant="outline-secondary"
                          size="sm"
                          disabled
                        >
                          Ticket Closed
                        </Button>
                      )
                    ) : null}

                  </div>
                </td>
              </tr>
              {expandedTickets[ticket.id] && (
                <tr>
                  <td colSpan="6">
                    {expandedTickets[ticket.id].map((block) => (
                      <Card key={block.id} className="mb-2">
                        <Card.Header>
                          <small>
                            {dayjs(block.created_at).format('YYYY-MM-DD HH:mm:ss')} by <i><b>{block.author_name}</b></i>
                          </small>
                        </Card.Header>
                        <Card.Body>
                          {renderTextBlock(block.content)}
                        </Card.Body>
                      </Card>
                    ))}
                    {/* Form to add a new text block */}
                    {user && (ticket.state === "open" ? (
                      <Card className="mt-3">
                        <Card.Body>
                          <textarea
                            className="form-control"
                            placeholder="Add a new block of text..."
                            value={newBlock[ticket.id] || ''}
                            onChange={(e) =>
                              handleNewBlockChange(ticket.id, e.target.value)
                            }
                          />
                          <Button
                            variant="primary"
                            className="mt-2"
                            onClick={() => handleAddNewBlock(ticket.id)}
                            disabled={!newBlock[ticket.id]?.trim()}
                          >
                            Add Response
                          </Button>
                        </Card.Body>
                      </Card>
                    ) : null)}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
      {user ? (
        <Link to="/new" className="btn btn-success">
          Create New Ticket
        </Link>
      ) : (
        <Button variant="secondary" size="sm" disabled>
          Create New Ticket
        </Button>
      )}
    </Container>
  );
}

export default TicketList;
