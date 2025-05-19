'use strict'

const express = require('express'); 
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors')

const dao = require('./dao-tickets.js');
const user_dao = require('./dao-users.js');

const app = express();

const corsOptions={
    origin: 'http://localhost:5173',
    credentials: true,
};
//Middlewares
app.use(morgan('dev'));

app.use(cors(corsOptions)); 

app.use(express.json());

//Config Session
app.use(session({
    secret: "This is a very secret!! Don't you dare share this....",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: app.get('env') === 'production', sameSite: 'lax' },
}));

app.use(passport.initialize());
app.use(passport.session());

//Config passport
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy({ usernameField: 'email' }, async function(email,password,callback) {
    const user = await user_dao.getUser(email,password);
    if(!user){
        return callback(null,false,"Incorrect username or password");
    }
    return callback(null,user);
}));

passport.serializeUser(function(user,callback){
    callback(null,user.id);
});

passport.deserializeUser(async (id,callback) => {
    try {
        const u = await user_dao.getUserById(id);
        console.log("Deserialized user:", u);
        callback(null, u);
    } catch (err) {
        console.error("Deserialize error:", err);
        callback(err, null);
    }
});


const isLoggedIn = (req,res,next) =>{
    if(req.isAuthenticated()){
        return next();
    }
    return res.status(400).json({error:"Not authenticated"});
} 


app.get('/api/tickets',(req,res)=>{
    dao.listTickets().then(t=>res.json(t)).catch((err)=>res.status(500).json(err))
})

app.get('/api/tickets/:id', isLoggedIn, async (req, res) => {
  const ticket_id = req.params.id;
  const user_id = req.user.id;
  const isAdmin = req.user.is_admin;
  console.log(`Fetching ticket: ID ${ticket_id}`);
  
  try {
    const ticket = await dao.getTicket(ticket_id);
    if (!ticket) {
      console.error(`Ticket not found: ID ${ticket_id}`);
      return res.status(404).json({ error: "Ticket not found" });
    }
    if (ticket.owner_id !== user_id && !isAdmin) {
      console.warn(`Access denied: User ${user_id} is not the owner or an admin.`);
      return res.status(403).json({ error: "Unauthorized access" });
    }

    res.json(ticket);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res.status(500).json({ error: err.message || "Failed to get the ticket" });
  }
});


app.post('/api/tickets',isLoggedIn,(req,res)=>{
    const { state, category, title, timeStamp } = req.body;
    const user = req.user;
    const newTicket = { 
      state, 
      category, 
      title, 
      timeStamp, 
      owner_name: user.name // Correctly passing the name field
  };
    console.log(newTicket);
    dao.createTicket(newTicket,user.id)
    .then((ticketID)=>{ 
      newTicket.id = ticketID;  
      res.status(201).json(newTicket)
    })
    .catch((err)=>{
        console.error("Error creating Ticket",err);
        res.status(500).json({error: err.msg || "Failed to create ticket"})
    });
});

// Update ticket endpoint
app.put('/api/tickets/:id', async (req, res) => {
  const ticketId = req.params.id;
  const { state, category } = req.body;
  
  // You might add further server-side validation here.  
  // For example, you could enforce that a ticket once closed cannot be reopened.
  try {
    const updatedTicket = await dao.updateTicket(ticketId, { state, category });
    res.json(updatedTicket);
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tickets/:id/textblocks', isLoggedIn, (req, res) => {
  const ticket_id = req.params.id;
  const { content } = req.body;
  const author_id = req.user.id;
  const textBlockData = {
    ticket_id,                            // associates the text block with this ticket
    author_id,                       // the author of the text block
    content,                           // content of the text block
    timeStamp: new Date().toISOString()        // creation timestamp
  };
  console.log(textBlockData);
  dao.createTicketTextBlocks(textBlockData)
    .then(newTextBlockId => {
      res.status(201).json({ id: newTextBlockId });
    })
    .catch(err => {
      console.error("Error creating ticket text block:", err);
      res.status(500).json({ error: err.message || "Failed to create ticket text block" });
    });
});


// GET all text blocks for a given ticket (requires login)
// Endpoint: GET /api/tickets/:id/textblocks
app.get('/api/tickets/:id/textblocks', isLoggedIn, (req, res) => {
  const ticket_id = req.params.id;
  dao.getTicketTextBlocks(ticket_id)
    .then(blocks => res.json(blocks))
    .catch(err => {
      console.error("Error retrieving text blocks:", err);
      res.status(500).json({ error: err.message || "Failed to retrieve text blocks" });
    });
});

///User api

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err){
            console.error("Session creation error",err)
            return next(err);
        }
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});


app.listen(3000,()=>console.log('Server Ready'));