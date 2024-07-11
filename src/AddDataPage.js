import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, Container, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
function AddDataPage() {
  const [userData, setUserData] = useState({
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

  const [selectedUniversity, setSelectedUniversity] = useState('');

  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const handleChange = (e) => {
    setSelectedUniversity(e.target.value);
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user && image) {
      const storage = getStorage();
      const imageRef = ref(storage, `images/${Date.now()}_${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(snapshot.ref);
  
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...userData,
        imageUrl,
        hasCompletedOnboarding: true,
      });
      navigate('/');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Add Your Data
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="fullName"
            label="Full Name"
            name="fullName"
            autoComplete="name"
            autoFocus
            value={userData.fullName}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            autoComplete="description"
            multiline
            rows={4}
            value={userData.description}
            onChange={handleChange}
          />
            <FormControl fullWidth margin="normal">
            <InputLabel id="cleanlinessLevel">How messy are you?</InputLabel>
            <Select
              labelId="cleanlinessLevel-label"
              id="cleanlinessLevel"
              name="cleanlinessLevel"
              value={userData.cleanlinessLevel}
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
              value={userData.smoke}
              label="Do you smoke?"
              onChange={handleChange}
            >
              <MenuItem value={"Regularly"}>Regularly</MenuItem>
              <MenuItem value={"Sometimes"}>Sometimes</MenuItem>
              <MenuItem value={"Never"}>Never</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="alcohol-label">Do you drink?</InputLabel>
            <Select
              labelId="alcohol-label"
              id="alcohol"
              name="alcohol"
              value={userData.alcohol}
              label="Do you drink?"
              onChange={handleChange}
            >
              <MenuItem value={"Regularly"}>Regularly</MenuItem>
              <MenuItem value={"Sometimes"}>Sometimes</MenuItem>
              <MenuItem value={"Never"}>Never</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="sleep-label">What is your sleep schedule like</InputLabel>
            <Select
              labelId="sleep-label"
              id="sleep"
              name="sleep"
              value={userData.sleep}
              label="sleep"
              onChange={handleChange}
            >
              <MenuItem value={"Night Owl"}>Night Owl</MenuItem>
              <MenuItem value={"Early Bird"}>Early Bird</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              id="gender"
              name="gender"
              value={userData.gender}
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
      value={selectedUniversity}
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
            value={userData.country}
            onChange={handleChange}
          />

          <input
            accept="image/*"
            type="file"
            onChange={handleImageChange}
            style={{ marginTop: '20px', marginBottom: '20px' }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default AddDataPage;
