import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleLogin = (e) => {
    e.preventDefault();
    // 在此处添加登录功能，如发送登录请求
    // 并处理用户登录成功后的操作
    console.log('Login successful');
    history.push('/');
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/register">Register</a>
      </p>
      <p>Or</p>
      <a href="/auth/google" className="login-button google">
  Login with Google
</a>
<a href="/auth/facebook" className="login-button facebook">
  Login with Facebook
</a>
    </div>
  );
}

export default Login;
