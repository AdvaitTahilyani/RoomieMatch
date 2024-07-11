import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TinderCards from './TindersCards';
import Chats from './Chats';
import ChatScreen from './ChatScreen';
import SignIn from './signin';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';
import AddDataPage from './AddDataPage';
import Profile from './Profile';
import ProfileDisplay from './ProfileDisplay';
import HeaderLogIn from './Header1';
import { useState } from 'react';

function App() {
  const [swipedUserId, setSwipedUserId] = useState(null);

  const handleSwipeApp = (userId) => {
    setSwipedUserId(userId);
  };
  return (

    <div className="App">
      <Router>
        <Routes>
          <Route path="/chat/:chatId" element={
            <ProtectedRoute>
              <>
                <Header backButton="/chat"/>
                <ChatScreen />
              </>
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <>
                <Header backButton="/"/>
                <Chats />
              </>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <>
                <Header backButton="/profiledisplay"/>
                <Profile />
              </>
            </ProtectedRoute>
          } />
          <Route path="/profiledisplay" element={
            <ProtectedRoute>
              <>
                <Header backButton="/"/>
                <ProfileDisplay />
              </>
            </ProtectedRoute>
          } />
          <Route path="/add-data" element={<ProtectedRoute>
              <>
                <HeaderLogIn />
                <AddDataPage />
              </>
            </ProtectedRoute>} />
          <Route path="/login" element={
            <>
              <SignIn />
            </>
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Header />
                <TinderCards />
              </>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
