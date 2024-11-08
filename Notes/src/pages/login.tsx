import auth from "../auth/auth.tsx";

const Login = () => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = e.currentTarget.email.value;
        const password = e.currentTarget.password.value;
        auth.handleLogin(email, password);
    }
    return (
        <div className="login">
`            <h1 className="login_title">TimeCue Notes</h1>
            <h1>Sign in to your account</h1>
            <form onSubmit={handleSubmit}>
                <div>
                <h3>Email</h3>
                <input name="email" placeholder="example@gmail.com" type="email"/>
                    </div>
                <div>
                <h3>Password</h3>
                <input name="password" placeholder="••••••••" type="password"/>
                    </div>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="https://server798294.nazwa.pl/timecue/accountlogin.php?type=register">Sign up</a></p>`
        </div>
    )
}
export default Login;