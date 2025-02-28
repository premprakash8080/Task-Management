import React, { Component } from 'react';
import axios from 'axios';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            error: '',
            loading: false,
        };
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.setState({ loading: true, error: '' });

        const { username, password } = this.state;

        axios.post('http://localhost:9000/users/login', { username, password })
            .then(response => {
                // Handle successful login (e.g., save token, redirect)
                console.log('Login successful:', response.data);
                // Redirect or update state as needed
            })
            .catch(error => {
                this.setState({ error: 'Login failed. Please check your credentials.', loading: false });
                console.error('Login error:', error);
            });
    };

    render() {
        const { username, password, error, loading } = this.state;

        return (
            <div className="login-container">
                <h2>Login</h2>
                {error && <div className="error">{error}</div>}
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <label>Username:</label>
                        <input type="text" name="username" value={username} onChange={this.handleChange} required />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input type="password" name="password" value={password} onChange={this.handleChange} required />
                    </div>
                    <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                </form>
            </div>
        );
    }
}

export default Login; 