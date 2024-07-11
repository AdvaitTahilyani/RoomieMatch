import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import './ChatScreen.css';
import Avatar from "@mui/material/Avatar";
import { getFirestore, doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function ChatScreen() {
  const [containerHeight, setContainerHeight] = useState("400px");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [matchName, setMatchName] = useState('');
  const [matchTimestamp, setMatchTimestamp] = useState('');
  const { chatId } = useParams();
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]); // Dependency on messages to trigger scroll on update

  useEffect(() => {
    if (chatId && currentUser) {
        const chatRef = doc(db, 'chats', chatId);
        const unsubscribe = onSnapshot(chatRef, (docSnapshot) => {
            const chatData = docSnapshot.data();
            setMessages(chatData.messages || []);
            if (chatData.createdAt) {
                // Format the timestamp to only show the date
                setMatchTimestamp(new Date(chatData.createdAt.seconds * 1000).toLocaleDateString());
            }

            const otherUserId = chatData.users.find(id => id !== currentUser.uid);
            if (otherUserId) {
                fetchOtherUserDetails(otherUserId);
            }
        });

        return () => unsubscribe();
    }
  }, [chatId, currentUser, db]);

  const fetchOtherUserDetails = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        setMatchName(userData.fullName);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentUser || !chatId) return;
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        messages: arrayUnion({
          senderId: currentUser.uid,
          message: input,
          timestamp: new Date(),
        }),
      });
      setInput("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="chatScreen">
      <p className="chatScreen_timestamp">YOU MATCHED WITH {matchName.toUpperCase()} ON {matchTimestamp}</p>
    <div className="chatScreen_messages">
        {messages.map((message, index) => (
            message.senderId === currentUser.uid ? (
                <div key={index} className="chatScreen_message">
                    <p className="chatScreen_textUser">{message.message}</p>
                </div>
            ) : (
                <div key={index} className="chatScreen_message">
                    <Avatar className="chatScreen_image" alt={message.fullName} src={message.imageUrl}/>
                    <p className="chatScreen_text">{message.message}</p>
                </div>
            )
        ))}
        <div ref={messagesEndRef} />
    </div>

      <form className="chatScreen_input">
        <input value={input} onChange={e => setInput(e.target.value)} className="chatScreen_inputField" placeholder="Type a message..." type="text" />
        <button onClick={handleSend} type="submit" className="chatScreen_inputButton">SEND</button>
      </form>
    </div>
  );
}

export default ChatScreen;
