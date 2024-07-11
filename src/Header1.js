import React from "react";
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import "./Header1.css";

function HeaderLogIn() {
    return (
        <div className="header">
            <div className="header__logoContainer">
                <img
                    className="header__logo"
                    src="https://i.postimg.cc/9X86yBj6/logo.jpg"
                    alt="logo"
                />
            </div>
        </div>
    );
    
    
}
export default HeaderLogIn;