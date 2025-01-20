import React from 'react'
import '../css/cardButton.css'
import { useNavigate } from 'react-router-dom';

const ButtonCard = ({ cardColor }) => {
    const nav = useNavigate();

    return (
        <button className={`card-button m-auto ${cardColor}`} onClick={() => nav('/form')}>
            <div className="overlay"></div>
            <div className="circle">
                <i className="bi bi-file-earmark-plus me-2"></i>
            </div>
            <p>Add New</p>
        </button>
    )
}

export default ButtonCard