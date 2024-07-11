import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import ForumIcon from '@mui/icons-material/Forum';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Avatar from "@mui/material/Avatar";
import "./Header.css";
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

function Header({ backButton }) {
    const [userPfp, setUserPfp] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            getDoc(userRef).then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    setUserPfp(docSnapshot.data().imageUrl);
                }
            }).catch((error) => {
                console.error("Error fetching user data:", error);
            });
        }
    }, [currentUser, db]);

    return (
        <div className="header">
            <div className="header__left">
                {backButton ? (
                    <IconButton onClick={() => navigate(backButton)}>
                        <ArrowBackIosIcon fontSize="large" className="header__icon" />
                    </IconButton>
                ) : (
                    <IconButton onClick={() => navigate("/profiledisplay")}>
                        {userPfp ? (
                            <Avatar src={userPfp} className="header__icon" />
                        ) : (
                            <Avatar className="header__icon" />
                        )}
                    </IconButton>
                )}
            </div>
            <Link to='/' className="header__logoContainer">
                <img
                    className="header__logo"
                    src="https://i.postimg.cc/9X86yBj6/logo.jpg"
                    alt="logo"
                />
            </Link>
            <div className="header__right">
                <Link to='/chat'>
                    <IconButton>
                        <ForumIcon className="header__icon" fontSize="large" />
                    </IconButton>
                </Link>
            </div>
        </div>
    );
}

export default Header;
