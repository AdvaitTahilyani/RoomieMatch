import React, { useState, useEffect } from 'react';
import './Chats.css';
import Chat from './Chat';
import { Link } from 'react-router-dom';
import { collection, getDocs, getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function Chats() {
    const [chats, setChats] = useState([]);
    const db = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser; // Ensure currentUser is available or manage its state accordingly

    useEffect(() => {
        if (currentUser) {
            // Listen for changes in the chats collection
            const unsubscribe = onSnapshot(collection(db, 'chats'), (snapshot) => {
                let chatsData = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(chat => chat.users.includes(currentUser.uid));
    
                // Map over chatsData to fetch user details
                Promise.all(chatsData.map(async (chat) => {
                    const otherUserId = chat.users.find(id => id !== currentUser.uid);
                    if (!otherUserId) return null; // If there's no other user, return null here
                    
                    const userRef = doc(db, 'users', otherUserId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        return {
                            ...chat,
                            userName: userData.fullName,
                            profilePic: userData.imageUrl,
                        };
                    }
                    return null; // If the other user doesn't exist, return null
                }))
                .then(filteredChats => {
                    const validChats = filteredChats.filter(chat => chat !== null); // Filter out the nulls
                    validChats.sort((a, b) => {
                        const lastMessageA = a.messages?.[a.messages.length - 1]?.timestamp;
                        const lastMessageB = b.messages?.[b.messages.length - 1]?.timestamp;
                        return lastMessageB?.toDate() - lastMessageA?.toDate();
                    });
                    setChats(validChats);
                });
            });
            
            return () => unsubscribe(); // Cleanup subscription
        }
    }, [currentUser, db]);
    

    return (
        <div className="chats">
            {chats.map((chat) => {
                // Extract and format the timestamp of the last message for display
                const lastMessage = chat.messages[chat.messages.length - 1];
                const timestampDate = lastMessage?.timestamp.toDate();
                const formattedTime = timestampDate?.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                });

                return (
                    <Link key={chat.id} to={`/chat/${chat.id}`}>
                        <Chat
                            name={chat.userName}
                            message={lastMessage?.message || "No message"} // Display the last message or a placeholder
                            timestamp={formattedTime || "Unknown time"} // Display the formatted timestamp or a placeholder
                            profilePic={chat.profilePic || ""} // Display the profile picture if available
                        />
                    </Link>
                );
            })}
        </div>
    );
}

export default Chats;
