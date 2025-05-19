import React, { use } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import TicketList from './components/TicketList.jsx';
import TicketDetails from './components/TicketDetail.jsx';
import TicketForm from './components//TicketForm.jsx';
import MyNavBar from './components/MyNavBar.jsx';
import LogInComponent from './components/LogInComponent.jsx';
import MyFooter from './components/ MyFooterComponent.jsx';
import { useState, useEffect} from 'react';
import API from './API.js';
import './App.css';


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [ticketList,setTicketList] = useState([]);
  const [dirty,setDirty] = useState(true);


  // Example: authenticate the user when the app loads.
  useEffect(() => {
    const auth = async () => {
      try {
        const usr = await API.getUserInfo();
        if (usr) {
          setUser(usr);
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      } catch (err) {
        console.error(err);
        setLoggedIn(false);
      }
    };
    auth();
  }, []);

  const handleLogIn = async (credentials) => {
    try {
      const usr = await API.logIn(credentials);
      if (usr && !usr.error) {
        setUser(usr);
        setLoggedIn(true);
      }
      return usr;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(null);
  };
 

  useEffect(()=>{
    if(dirty){
      API.getTickets()
      .then(t=>{
        setTicketList(t);
        setDirty(false);
      });
    }
  },[dirty])
  

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes that require the navbar (via the layout) */}
        <Route element={<Layout user={user} handleLogOut={handleLogOut} />}>
          <Route
            path="/"
            element={
              <TicketList ticketList={ticketList} user={user} setDirty={setDirty}/> /*: <Navigate replace to="/login"/>*/ 
            }
          />
          <Route
            path="/ticket/:id"
            element={/* loggedIn ?*/<TicketDetails  /> }
          />
          <Route
            path="/new"
            element={<TicketForm user={user} setDirty={setDirty} />}
          />
        </Route>
        <Route
          path="/login"
          element={<LogInComponent handleLogIn={handleLogIn} />}
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}


function Layout(props) {
  return (
    <>
      {/* The navbar appears on every page */}
      <MyNavBar user={props.user} handleLogOut={props.handleLogOut} />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '94vh' }}>
      {/* Container for the child route components */}
      <div style={{ flex: 1, marginTop: "10px", padding: "0 10px" }}>        
        <Outlet />
      </div>
      <MyFooter/>
      </div>
    </>
  );
}



export default App;
