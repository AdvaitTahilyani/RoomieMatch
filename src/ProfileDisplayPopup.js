import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { database } from './firebase';
import { Container, Paper, Typography, Button, Avatar, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import './ProfileDisplayPopup.css';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

function ProfileDisplayPopup({ userId }) {
    const [profile, setProfile] = useState({
        description: '',
        email: '',
        fullName: '',
        country: '',
        alcohol: '',
        smoke: '',
        gender: '',
        sleep: '',
        university: '',
        imageUrl: '',
        hasCompletedOnboarding: false
    });
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const fetchUserId = userId;
        console.log("fetchUserId:", fetchUserId);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (fetchUserId) {
                fetchProfileData(fetchUserId);
            } else if (user) {
                fetchProfileData(user.uid);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    const fetchProfileData = async (uid) => {
        const docRef = doc(database, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setProfile(docSnap.data());
        } else {
            console.log("No such document!");
        }
    };

    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate('/');
        }).catch((error) => {
            console.error("Logout error:", error);
        });
    };

    return ( 
        <Container className="mainContainer">


        <Container component="main" maxWidth="sm">
            <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
                <Paper elevation={3} className="profilePaper">
                    <Box display="flex" flexDirection="column" alignItems="center" p={3}>
                        <Avatar alt="Profile Image" src={profile.imageUrl} sx={{ width: 90, height: 90, mb: 2 }} />
                        <Typography variant="h5" component="h1" className="profileTitle">
                            User Profile
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Full Name: {profile.fullName}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Alcohol Usage: {profile.alcohol}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Smoking Habits: {profile.smoke}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            University: {profile.university}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Gender: {profile.gender}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Sleeping Schedule: {profile.sleep}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Cleanliness Level: {profile.cleanlinessLevel}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Description: {profile.description}
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
        </Container>
    );
}

export default ProfileDisplayPopup;
