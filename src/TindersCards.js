import React, { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { getFirestore, collection, onSnapshot, query, doc, updateDoc, arrayUnion, getDoc, addDoc, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Dialog, DialogContent, Card, CardContent, Typography, CardActions, Button, IconButton, MenuItem, Select, InputLabel, FormControl} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import './TinderCards.css';
import FilterListIcon from '@mui/icons-material/FilterList';
import ProfileDisplayPopup from './ProfileDisplayPopup';



function TinderCards() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState({ gender: '', university: '', sleepingHabits: '', alcoholConsumption: '', cleanlinessLevel: '' });
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const toggleDropdown = () => setIsDropdownOpen(prevState => !prevState);
  
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        const currentUserDocRef = doc(db, 'users', user.uid);
        getDoc(currentUserDocRef)
          .then(docSnapshot => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              setFilters(prevFilters => ({
                ...prevFilters,
                university: userData.university
              }));
            }
          })
          .catch(error => {
            console.error('Error fetching current user data:', error);
          });
  
        const q = query(collection(db, 'users'));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const peopleArray = snapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))
            .filter(person => person.id !== user.uid);
          setUsers(peopleArray);
          console.log('Fetched Users:', peopleArray);
        });
        return unsubscribeSnapshot;
      }
    });
    return unsubscribeAuth;
  }, [db]);
  
  useEffect(() => {
    const filtered = users.filter(user => {
      return (!filters.gender || user.gender === filters.gender) &&
             (!filters.sleep || user.sleep === filters.sleep) &&
             (!filters.alcohol || user.alcohol === filters.alcohol) &&
             (!filters.cleanlinessLevel || user.cleanlinessLevel === filters.cleanlinessLevel);
    });
  
    setFilteredUsers(filtered);
    setCurrentIndex(0);
  }, [users, filters]);
  
  

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };
  

   const handleCardClick = (person) => {
    setSelectedUser(person);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const handleSwipe = (dir) => {

    const swipedUserId = users[users.length - currentIndex - 1]?.id;
    if (!swipedUserId) return;

    console.log(`Swiped ${dir} on user with ID: ${swipedUserId}`);
    if (dir === 'right') {
      handleRightSwipe(swipedUserId);
    }
    else {
        handleLeftSwipe();
    }
    setCurrentIndex(currentIndex + 1);
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

const handleRightSwipe = async (swipedUserId) => {
    const cards = document.querySelectorAll('.card');
    const lastCardIndex = cards.length - 1;
    if (lastCardIndex >= 0 && lastCardIndex < cards.length) {
        const lastCard = cards[lastCardIndex];
        if (lastCard) {
            lastCard.style.transform = 'translateX(100%)';
            lastCard.addEventListener('transitionend', async () => {
                lastCard.remove();
                if (currentUser && swipedUserId) {

                    const userLikesRef = doc(db, 'users', currentUser.uid);
                    await updateDoc(userLikesRef, {
                        likes: arrayUnion(swipedUserId),
                    });

                    const chatsRef = collection(db, 'chats');
                    const q = query(chatsRef, where('users', 'in', [[currentUser.uid, swipedUserId], [swipedUserId, currentUser.uid]]));

                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        console.log("Chat already exists between these users.");
                    } else {
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
                }
            });
        }
    } else {
        console.log("No more cards or index out of bounds.");
    }
};



  return (
    <>
        <IconButton onClick={toggleDropdown} className="filterButton">
      <FilterListIcon />
    </IconButton>

    {isDropdownOpen && (
  <div className="filterForm">
    <FormControl fullWidth margin="normal">
      <InputLabel>Gender</InputLabel>
      <Select
        name="gender"
        value={filters.gender}
        onChange={handleFilterChange}
        label="Gender"
      >
        <MenuItem value="">Any</MenuItem>
        <MenuItem value="Male">Male</MenuItem>
        <MenuItem value="Female">Female</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </Select>
    </FormControl>

    <FormControl fullWidth margin="normal">
      <InputLabel>Sleeping Habits</InputLabel>
      <Select
        name="sleep"
        value={filters.sleep}
        onChange={handleFilterChange}
        label="Sleeping Habits"
      >
        <MenuItem value="">Any</MenuItem>
        <MenuItem value="Early Bird">Early Bird</MenuItem>
        <MenuItem value="Night Owl">Night Owl</MenuItem>
      </Select>
    </FormControl>

    <FormControl fullWidth margin="normal">
      <InputLabel>Alcohol Consumption</InputLabel>
      <Select
        name="alcohol"
        value={filters.alcohol}
        onChange={handleFilterChange}
        label="Alcohol Consumption"
      >
        <MenuItem value="">Any</MenuItem>
        <MenuItem value="Regularly">Regularly</MenuItem>
        <MenuItem value="Sometimes">Sometimes</MenuItem>
        <MenuItem value="Never">Never</MenuItem>
      </Select>
    </FormControl>

    <FormControl fullWidth margin="normal">
      <InputLabel>Cleanliness Level</InputLabel>
      <Select
        name="cleanlinessLevel"
        value={filters.cleanlinessLevel}
        onChange={handleFilterChange}
        label="Cleanliness Level"
      >
        <MenuItem value="">Any</MenuItem>
        <MenuItem value="Neat">Neat</MenuItem>
        <MenuItem value="Average">Average</MenuItem>
        <MenuItem value="Messy">Messy</MenuItem>
      </Select>
    </FormControl>
    <Button
      variant="contained"
      onClick={toggleDropdown}
      sx={{ mt: 2 }}
    >
      Apply Filters
    </Button>
  </div>
)}

    
      <div className="tinderCards_cardContainer">
  {filteredUsers.map((person, index) => (
    <TinderCard
      className="swipe"
      key={person.id}
      onSwipe={(dir) => handleSwipe(dir)}
      preventSwipe={['up', 'down']}
    >
      <div
        style={{ backgroundImage: `url(${person.imageUrl})` }}
        className="card"
        onClick={() => handleCardClick(person)}
      >
        <h3>{person.fullName}</h3>
      </div>
    </TinderCard>
  ))}
</div>
<div className="swipeButtons">
    <IconButton
        className="swipeButtons_left"
        onClick={() => handleSwipe('left')}
        style={{ color: '#ff5252' }}
    >
        <ThumbDownAltIcon fontSize="large" />
    </IconButton>
    <IconButton
        className="swipeButtons_right"
        onClick={() => handleSwipe('right')}
        style={{ color: '#4caf50' }}
    >
        <ThumbUpIcon fontSize="large" />
    </IconButton>
</div>

      {currentIndex >= users.length && (
        <Typography variant="h6" style={{ textAlign: 'center', marginTop: '20px' }}>
          You have seen every person in your vicinity.
        </Typography>
      )}
      {selectedUser && (
        <Dialog
  open={isModalOpen}
  onClose={handleCloseModal}
  fullWidth={true}
  maxWidth="sm"
  PaperProps={{
    style: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      overflow: 'visible',
    },
  }}
>
  <ProfileDisplayPopup userId={selectedUser.id} />
</Dialog>
)}

    </>
  );
}

export default TinderCards;








