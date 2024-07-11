import React, {useState} from 'react';
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from '@mui/icons-material/Favorite';
import RecommendIcon from '@mui/icons-material/Recommend';
import IconButton from '@mui/material/IconButton';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, arrayUnion, getDoc, addDoc, collection } from 'firebase/firestore';
import { Typography } from '@mui/material';

import './SwipeButtons.css';

const SwipeButtons = ({ swipedUserId, swipedCount, totalUsers }) => {
    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    const handleRightSwipe = async () => {
        console.log('swipedUserId', swipedUserId);
        const cards = document.querySelectorAll('.card');
        if (cards.length > 0) {
            const lastCard = cards[cards.length - 1];
            lastCard.style.transform = 'translateX(100%)';
            lastCard.addEventListener('transitionend', async () => {
                if (currentUser && swipedUserId) {
                    const userLikesRef = doc(db, 'users', currentUser.uid);
                    await updateDoc(userLikesRef, {
                        likes: arrayUnion(swipedUserId),
                    });
    
                    const swipedUserRef = doc(db, 'users', swipedUserId);
                    const swipedUserDoc = await getDoc(swipedUserRef);
                    if (swipedUserDoc.exists()) {
                        const swipedUserData = swipedUserDoc.data();
                        if (swipedUserData.likes && swipedUserData.likes.includes(currentUser.uid)) {
                            const chatRef = await addDoc(collection(db, 'chats'), {
                                users: [currentUser.uid, swipedUserId],
                                messages: [],
                                createdAt: new Date()
                            });
                            console.log(`Matched! Chat created with ID: ${chatRef.id}`);
                        }
                    }
                }
                lastCard.remove();
            });
        }
    };

    const handleLeftSwipe = () => {
        const cards = document.querySelectorAll('.card');
        if (cards.length > 0) {
            const lastCard = cards[cards.length - 1];
            lastCard.style.transform = 'translateX(-100%)';
            lastCard.addEventListener('transitionend', () => {
                lastCard.remove();
            });
        }
    };

    return (
        <div className="swipeButtons">
            <IconButton className="swipeButtons_left" onClick={handleLeftSwipe}>
                <CloseIcon fontSize="large" />
            </IconButton>
            <IconButton className="swipeButtons_right" onClick={handleRightSwipe}>
                <FavoriteIcon fontSize="large" />
            </IconButton>
            
        </div>
    );
};

export default SwipeButtons;

