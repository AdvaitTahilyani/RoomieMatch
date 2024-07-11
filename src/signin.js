import React, { useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Container, Box } from "@mui/material";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import './signin.css';

const db = getFirestore();

function SignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    auth.onAuthStateChanged(user => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef).then(docSnapshot => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            if (userData.hasCompletedOnboarding) {
              navigate("/");
            } else {
              navigate("/add-data");
            }
          } else {
            setDoc(userRef, { hasCompletedOnboarding: false, email: user.email });
            navigate("/add-data");
          }
        });
      }
    });
  }, [navigate]);

  const handleClick = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
      })
      .catch((error) => {
        console.error("Error signing in: ", error);
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
        }}
      >
        <img src="https://i.postimg.cc/9X86yBj6/logo.jpg" alt="Future Roommate Logo" className="signin-logo" />
        <Typography component="h1" variant="h5" className="signin-heading">
          Find your future roommate
        </Typography>
        <Typography variant="body1" className="signin-tagline">
          Connect with students and find your match.
        </Typography>
        <Button
          startIcon={<img src="https://expresswriters.com/wp-content/uploads/2015/09/google-new-logo-450x450.jpg" alt="Google sign-in" />}
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleClick}
          className="google-signin-button"
        >
          Sign in with Google
        </Button>
      </Box>
    </Container>
  );
}

export default SignIn;