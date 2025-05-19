  'use strict';

  const sqlite3 = require("sqlite3");
  const dayjs = require("dayjs");
  const dao_users = require('./dao-users.js'); // if needed

  const db = new sqlite3.Database('database_test.db', (err) => {
    if (err) { throw err; }
  });

  // Conversion functions for tickets and text blocks.
  const convertTicketFromDb = (dbRecord) => {
    return {
      id: dbRecord.id,
      owner_name: dbRecord.owner_name,
      owner_id: dbRecord.owner_id,
      state: dbRecord.state,
      category: dbRecord.category,
      title: dbRecord.title,
      timeStamp: dbRecord.created_at
    };
  };

  const convertTextBlockFromDb = (dbRecord) => {
    return {
      id: dbRecord.id,
      ticket_id: dbRecord.ticket_id,
      author_id: dbRecord.author_id,
      content: dbRecord.content,
      created_at: dbRecord.created_at,
      author_name: dbRecord.author_name,  
    };
  };

  // List all tickets.
  exports.listTickets = () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM tickets";
      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        const tickets = rows.map(row => convertTicketFromDb(row));
        resolve(tickets);
      });
    });
  };

  // Get a single ticket by ID
  exports.getTicket = (ticket_id) => {
      return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM tickets WHERE id = ?";
        db.get(sql, [ticket_id], (err, row) => {
          if (err) {
            return reject(err);
          }
          if (!row) {
            return resolve(null); // Return null if the ticket doesn't exist
          }
          resolve(convertTicketFromDb(row));
        });
      });
    };
  
    exports.updateTicket = (ticketId, updateData) => {
      return new Promise((resolve, reject) => {
        // First, retrieve the current ticket.
        const sqlSelect = "SELECT * FROM tickets WHERE id = ?";
        db.get(sqlSelect, [ticketId], (err, row) => {
          if (err) {
            return reject(err);
          }
          if (!row) {
            return reject(new Error("Ticket not found"));
          }
          // Build the update query dynamically.
          let fields = [];
          let params = [];
          if (updateData.state !== undefined) {
            fields.push("state = ?");
            params.push(updateData.state);
          }
          if (updateData.category !== undefined) {
            fields.push("category = ?");
            params.push(updateData.category);
          }
          if (fields.length === 0) {
            return resolve(convertTicketFromDb(row));
          }
          const sqlUpdate = `UPDATE tickets SET ${fields.join(", ")} WHERE id = ?`;
          params.push(ticketId);
          db.run(sqlUpdate, params, function (err) {
            if (err) {
              return reject(err);
            }
            // Retrieve the updated ticket.
            db.get("SELECT * FROM tickets WHERE id = ?", [ticketId], (err, updatedRow) => {
              if (err) {
                return reject(err);
              }
              resolve(convertTicketFromDb(updatedRow));
            });
          });
        });
      });
    };

  // Get all text blocks for a given ticket.
  exports.getTicketTextBlocks = (ticket_id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT ttb.*, u.name AS author_name 
      FROM ticket_text_blocks ttb 
      JOIN users u ON ttb.author_id = u.id 
      WHERE ttb.ticket_id = ?`;
      db.all(sql, [ticket_id], (err, rows) => {
        if (err) {
          return reject(err);
        }
        const textBlocks = rows.map(row => convertTextBlockFromDb(row));
        resolve(textBlocks);
      });
    });
  };
  

  // Create a new ticket.
  exports.createTicket = (t, user_id) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO tickets (owner_id, owner_name, state, category, title, created_at) VALUES (?,?,?,?,?,?)';
      db.run(sql, [user_id, t.owner_name, t.state, t.category, t.title, t.timeStamp], function(err) {
        if (err) {
          return reject(err);
        }
        resolve(this.lastID);
      });
    });
  };

  // Create a new ticket text block.
  exports.createTicketTextBlocks = (tb) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO ticket_text_blocks (ticket_id, author_id, content, created_at) VALUES (?,?,?,?)';
      db.run(sql, [tb.ticket_id, tb.author_id, tb.content, tb.timeStamp], function(err) {        
        if (err) {
          return reject(err);
        }
        resolve(this.lastID);
      });
    });
  };
