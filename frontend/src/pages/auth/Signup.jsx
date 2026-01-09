
import AuthApi from "../../apiController/AuthApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export function Signup() {
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    async function signup(formData) {
        const res = await AuthApi.signup({
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        });
        if (res.error) {
            setMessage(res.error);
        } else {
            navigate('/login');
        }
    }
    return (
        <>
            <div className="mainContainer">

                <form onSubmit={(e) => { e.preventDefault(); signup(new FormData(e.target)) }}>
                    <input type="text" name="username" placeholder="Enter username" required />
                    <input type="email" name="email" placeholder="Enter Email" required />
                    <input type="password" name="password" placeholder="Enter password" required />
                    <input type="password" name="confirmPassword" placeholder="Confirm password" required />
                    <input type="submit" />
                </form>
                {message ? <p>{message}</p> : ""}
            </div>

        </>
    )

}