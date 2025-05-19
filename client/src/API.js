'use strict';

const url = 'http://localhost:3000/api';

async function getTickets() {
  try {
    const response = await fetch(url + '/tickets', { credentials: 'include' });
    const ticketList = await response.json();

    if (response.ok) {
      return ticketList.map(t => ({
        id: t.id,
        owner_name: t.owner_name,
        owner_id: t.owner_id,
        state: t.state,
        category: t.category,
        title: t.title,
        timeStamp: t.timeStamp || t.created_at,
        description: t.description || ""
      }));
    } else {
      throw response;
    }
  } catch (err) {
    console.error("Error getting Tickets", err);
    throw err;
  }
}

async function getTicket(id) {
  try {
    const response = await fetch(url + `/tickets/${id}`, { credentials: 'include' });
    const ticket = await response.json();

    if (response.ok) {
      // Assuming the API returns a single ticket object.
      return {
        id: ticket.id,
        owner_name: ticket.owner_name,
        owner_id: ticket.owner_id,
        state: ticket.state,
        category: ticket.category,
        title: ticket.title,
        timeStamp: ticket.timeStamp || ticket.created_at,
        description: ticket.description || ""
      };
    } else {
      throw response;
    }
  } catch (err) {
    console.error("Error getting Ticket", err);
    throw err;
  }
}

async function getTicketTextBlocks(ticketId) {
  try {
    const response = await fetch(url + `/tickets/${ticketId}/textblocks`, { credentials: 'include' });
    const blocks = await response.json();

    if (response.ok) {
      return blocks.map(b => ({
        id: b.id,
        ticket_id: b.ticket_id,
        author_id: b.author_id,
        author_name: b.author_name,
        content: b.content,
        created_at: b.created_at
      }));
    } else {
      throw response;
    }
  } catch (err) {
    console.error("Error getting Ticket Text Blocks", err);
    throw err;
  }
}

async function createTicket(ticket) {
  try {
    const response = await fetch(url + '/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(ticket)
    });
    if (!response.ok) throw new Error('Creating Ticket Failed');
    console.log(`Ticket ${JSON.stringify(ticket)} created`);
    return await response.json();
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

async function createTextBlock(textBlockData) {
  try {
    // Ensure that textBlockData.ticket_id holds the ticket ID;
    // textBlockData.block holds the content.
    const response = await fetch(url + `/tickets/${textBlockData.ticket_id}/textblocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: textBlockData.content })
    });
    if (!response.ok) {
      throw new Error("Failed to create text block");
    }
    return await response.json();
  } catch (err) {
    console.error("Error creating text block:", err);
    throw err;
  }
}

async function logIn(user) {
  try {
    const response = await fetch(url + '/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error('Login failed');
    console.log(`User ${user.email} logged in successfully`);
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function getUserInfo() {
  try {
    const response = await fetch(url + '/sessions/current', { credentials: 'include' });
    if (!response.ok) {
      return undefined;
    }
    const user = await response.json();
    if (!user || !user.email) throw new Error("User data is missing");
    console.log(`User ${user.email} found`);
    return user;
  } catch (error) {
    console.error('Getting user error:', error);
    throw error;
  }
}

async function logOut() {
  try {
    const response = await fetch(url + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error("Log out Failed");
    }
    console.log("Logged out successfully");
  } catch (e) {
    console.error("Error while logging out", e);
    throw e;
  }
}

async function updateTicket(ticketId, updateData) {
  const response = await fetch(`${url}/tickets/${ticketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error updating ticket: ${errorText}`);
  }
  return response.json();
}

const API = {
  getTickets,
  getTicket,
  getTicketTextBlocks,
  createTicket,
  createTextBlock,
  getUserInfo,
  logIn,
  logOut,
  updateTicket,
};

export default API;
