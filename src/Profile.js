import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database } from './firebase';
import { TextField, Button, Container, Paper, Typography, Avatar, Box } from '@mui/material';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const universities = [
    'Harvard University',
    'Stanford University',
    'MIT',
    'Caltech',
    'University of Chicago',
    'UIUC',
    'Northwestern University',
    'Princeton University',
    'Yale University',
    'Columbia University',
    'University of Pennsylvania',
    'University of Michigan - Ann Arbor',
    'Cornell University',
    'Johns Hopkins University',
    'University of California - Berkeley',
    'UCLA',
    'University of Wisconsin - Madison',
    'University of Texas - Austin',
    'University of Washington',
    'NYU',
  ];

function ProfilePage() {
    const [profile, setProfile] = useState({
        fullName: '',
        description: '',
        gender: '',
        university: '',
        country: '',
        alcohol: '',
        smoke: '',
        sleep: '',
        cleanlinessLevel: '',
    });
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [imageUpload, setImageUpload] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchProfileData(currentUser.uid);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchProfileData = async (uid) => {
        const docRef = doc(database, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setProfile(docSnap.data());
        } else {
            console.log("No such document!");
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;

        const updatedProfile = { ...profile };
        if (imageUpload) {
            const imageRef = ref(getStorage(), `profileImages/${user.uid}`);
            await uploadBytes(imageRef, imageUpload);
            updatedProfile.imageUrl = await getDownloadURL(imageRef);
        }
        
        await updateDoc(doc(database, 'users', user.uid), updatedProfile);
        navigate('/profiledisplay');
        console.log("Profile updated");
    };

    const handleChange = (e) => {
        setSelectedUniversity(e.target.value);
        const { name, value } = e.target;
        setProfile(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageUpload(e.target.files[0]);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: '100%', maxWidth: 500 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar
                            src={profile.imageUrl}
                            alt="Profile Picture"
                            sx={{ width: 100, height: 100, mb: 2 }}
                        />
                        <Typography variant="h5" component="h1" gutterBottom>
                            Edit Profile
                        </Typography>
                        <form noValidate autoComplete="off">
                            <TextField
                                id="fullName"
                                name="fullName"
                                label="Full Name"
                                value={profile.fullName}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                id="description"
                                name="description"
                                label="Description"
                                value={profile.description}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                            <FormControl fullWidth margin="normal">
            <InputLabel id="cleanlinessLevel">How messy are you?</InputLabel>
            <Select
              labelId="cleanlinessLevel-label"
              id="cleanlinessLevel"
              name="cleanlinessLevel"
              value={profile.cleanlinessLevel}
              label="How messy are you?"
              onChange={handleChange}
            >
              <MenuItem value={"Neat"}>Neat</MenuItem>
              <MenuItem value={"Average"}>Average</MenuItem>
              <MenuItem value={"Messy"}>Messy</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="smoke-label">Do you smoke?</InputLabel>
            <Select
              labelId="smoke-label"
              id="smoke"
              name="smoke"
              value={profile.smoke}
              label="Do you smoke?"
              onChange={handleChange}
            >
              <MenuItem value={"Regularly"}>Regularly</MenuItem>
              <MenuItem value={"Sometimes"}>Sometimes</MenuItem>
              <MenuItem value={"Never"}>Never</MenuItem>
            </Select>
          </FormControl>
                <FormControl fullWidth margin="normal">
            <InputLabel id="sleep-label">Sleeping Habits</InputLabel>
            <Select
              labelId="sleep-label"
              id="sleep"
              name="sleep"
              value={profile.sleep}
              label="Do you smoke?"
              onChange={handleChange}
            >
              <MenuItem value={"Night Owl"}>Night Owl</MenuItem>
              <MenuItem value={"Early Bird"}>Early Bird</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="alcohol-label">Do you drink?</InputLabel>
            <Select
              labelId="alcohol-label"
              id="alcohol"
              name="alcohol"
              value={profile.alcohol}
              label="Do you drink?"
              onChange={handleChange}
            >
              <MenuItem value={"Regularly"}>Regularly</MenuItem>
              <MenuItem value={"Sometimes"}>Sometimes</MenuItem>
              <MenuItem value={"Never"}>Never</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              id="gender"
              name="gender"
              value={profile.gender}
              label="Gender"
              onChange={handleChange}
            >
              <MenuItem value={"Male"}>Male</MenuItem>
              <MenuItem value={"Female"}>Female</MenuItem>
              <MenuItem value={"Other"}>Other</MenuItem>
            </Select>
          </FormControl>
           <TextField
      select
      margin="normal"
      required
      fullWidth
      id="university"
      label="University"
      name="university"
      autoComplete="university"
      value={profile.university}
      onChange={handleChange}
    >
      {universities.map((university) => (
        <MenuItem key={university} value={university}>
          {university}
        </MenuItem>
      ))}
    </TextField>
          <TextField
            margin="normal"
            required
            fullWidth
            id="country"
            label="Country"
            name="country"
            autoComplete="country"
            value={profile.country}
            onChange={handleChange}
          />                  
            
                            <Button
                                variant="contained"
                                component="label"
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Upload New Profile Image
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleImageChange}
                                />
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleUpdateProfile}
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Update Profile
                            </Button>
                        </form>
                    </Box>
                </Paper>
            </Box>
        </Container>
        
    );
}
export default ProfilePage;
