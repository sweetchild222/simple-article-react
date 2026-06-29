import React, { useState } from 'react';
import './Side.css';
import PrettyButton from '@gui/PrettyButton.js';
import { RiMenuUnfold3Line } from "react-icons/ri";
import { RiMenuFold3Line } from "react-icons/ri";
import {useNavigate} from 'react-router-dom';

// 1. Define navigation links array
const NAV_ITEMS = [

  { name: 'Dashboard', icon: '📊', path: '#dashboard' },
  { name: 'Analytics', icon: '📈', path: '#analytics' },
  { name: 'Messages', icon: '✉️', path: '#messages' },
  { name: 'Settings', icon: '⚙️', path: '#settings' },
];

export default function Sidebar() {

    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate()

    const onClickNavigateHome = (e) =>{

        navigate('/')
    }
    


    return (
        <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            {/* Sidebar Header & Toggle Trigger */}
            <div className="sidebar-header">
                {isOpen && <img src='/logo/logo.svg' alt='logo' height='64px' width='64px' onClick={onClickNavigateHome}/>}
                <PrettyButton type={'transparent'} style={{height:'64px', width:'64px'}} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <RiMenuFold3Line size={32}/> : <RiMenuUnfold3Line size={32}/>}
                </PrettyButton>
            </div>

            {/* Navigation List */}
            <nav className="sidebar-nav">
                <ul>
                {NAV_ITEMS.map((item, index) => (
                    <li key={index} className="nav-item">
                    <a href={item.path} className="nav-link">
                        <span className="nav-icon">{item.icon}</span>
                        {isOpen && <span className="nav-text">{item.name}</span>}
                    </a>
                    </li>
                ))}
                </ul>
            </nav>
        </div>
    );
}