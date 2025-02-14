import React, { useState } from 'react'
import '../css/loginSignup.css'
import { loginApi } from '../api/login';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getUserData } from '../redux/user/user-slice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const dispatch = useDispatch()

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await loginApi(email, password)
        console.log("Login response", response)
        localStorage.setItem('userData', JSON.stringify(response));
        navigate("/")
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h2 className="text-center text-dark mt-5">Login</h2>
                    <div className="my-3">
                        <form className="card-body cardbody-color p-lg-5" onSubmit={handleSubmit}>

                            <div className="text-center">
                                <img src="https://cdn.pixabay.com/photo/2016/03/31/19/56/avatar-1295397__340.png" className="img-fluid profile-image-pic img-thumbnail rounded-circle my-3"
                                    width="200px" alt="profile" />
                            </div>

                            <div className="mb-3">
                                <input value={email} onChange={handleEmailChange} type="email" className="form-control" id="Username" aria-describedby="emailHelp"
                                    placeholder="Email" />
                            </div>
                            <div className="mb-3">
                                <input value={password} onChange={handlePasswordChange} type="password" className="form-control" id="password" placeholder="password" />
                            </div>
                            <div className="text-center"><button type="submit" className="btn btn-color px-5 mb-5 w-100 btn-dark">Login</button></div>
                            <div id="emailHelp" className="form-text text-center mb-5 text-dark">Not
                                Registered? <a href="#" className="text-dark fw-bold"> Create an
                                    Account</a>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Login