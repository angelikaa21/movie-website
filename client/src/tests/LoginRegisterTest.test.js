import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { act } from 'react';
import Register from '../components/Register';
import Login from '../components/Login';


jest.mock('../api/auth', () => ({
    registerUser: jest.fn(),
    loginUser: jest.fn(),
}));

jest.mock('../utils/notification', () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
}));

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(() => jest.fn()),
}));


describe('Register Component', () => {
    it('should render the registration form', () => {
        render(<Register isOpen={true} onClose={jest.fn()} openLoginModal={jest.fn()} />);
        expect(screen.getByText('Create an Account')).toBeInTheDocument();
    });

    it('should show error if passwords do not match', () => {
        render(<Register isOpen={true} onClose={jest.fn()} openLoginModal={jest.fn()} />);

        fireEvent.change(screen.getByPlaceholderText('Enter password'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repeat password'), {
            target: { value: 'password456' },
        });

        fireEvent.click(screen.getByText('Register'));
        expect(screen.getByText('Passwords must match.')).toBeInTheDocument();
    });

    it('should call registerUser API on valid input', async () => {
        const { registerUser } = require('../api/auth');
        registerUser.mockResolvedValueOnce({});

        render(<Register isOpen={true} onClose={jest.fn()} openLoginModal={jest.fn()} />);

        fireEvent.change(screen.getByPlaceholderText('Enter username'), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter email'), {
            target: { value: 'testuser@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter password'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repeat password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByText('Register'));

        expect(registerUser).toHaveBeenCalledWith({
            name: 'testuser',
            login: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        });
    });

    it('should show error if registerUser API fails', async () => {
        const { registerUser } = require('../api/auth');
        const { showError } = require('../utils/notification');
        registerUser.mockRejectedValueOnce(new Error('Registration failed'));

        render(<Register isOpen={true} onClose={jest.fn()} openLoginModal={jest.fn()} />);

        fireEvent.change(screen.getByPlaceholderText('Enter username'), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter email'), {
            target: { value: 'testuser@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter password'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repeat password'), {
            target: { value: 'password123' },
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Register'));
        });
    
        expect(showError).toHaveBeenCalledWith(
            'A registration error has occurred. Please try again.'
        );
    });

    it('should open Register modal when "Register here" is clicked in Login modal', async () => {
        const openRegisterModal = jest.fn();
    
        render(<Login isOpen={true} onClose={jest.fn()} openRegisterModal={openRegisterModal} />);
    
        fireEvent.click(screen.getByText('Register here'));
    
        expect(openRegisterModal).toHaveBeenCalled();
    });

    it('should show error if user already exists during registration', async () => {
        const registerUser = require('../api/auth').registerUser;
        registerUser.mockRejectedValueOnce({ message: 'User already exists' });
    
        render(<Register isOpen={true} onClose={jest.fn()} openLoginModal={jest.fn()} />);
    
        fireEvent.change(screen.getByPlaceholderText('Enter username'), {
            target: { value: 'existingUser' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter password'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repeat password'), {
            target: { value: 'password123' },
        });
    
        await act(async () => {
            fireEvent.click(screen.getByText('Register'));
        });
    
        expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
    
});

describe('Login Component', () => {
    it('should render the login form', () => {
        render(<Login isOpen={true} onClose={jest.fn()} openRegisterModal={jest.fn()} />);
        expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    });

    it('should call loginUser API on valid input', async () => {
        const { loginUser } = require('../api/auth');
        loginUser.mockResolvedValueOnce({ token: 'test-token' });

        render(<Login isOpen={true} onClose={jest.fn()} openRegisterModal={jest.fn()} />);

        fireEvent.change(screen.getByPlaceholderText('Enter username'), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByText('Login'));

        expect(loginUser).toHaveBeenCalledWith({
            login: 'testuser',
            password: 'password123',
        });
    });

    it('should show error if loginUser API fails', async () => {
        const { loginUser } = require('../api/auth');
        const { showError } = require('../utils/notification');
        loginUser.mockRejectedValueOnce(new Error('Login failed'));
    
        render(<Login isOpen={true} onClose={jest.fn()} openRegisterModal={jest.fn()} />);
    
        fireEvent.change(screen.getByPlaceholderText('Enter username'), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter password'), {
            target: { value: 'password123' },
        });
    
        await act(async () => {
            fireEvent.click(screen.getByText('Login'));
        });
    
        expect(showError).toHaveBeenCalledWith('Login error. Try again.');
    });    

    it('should have empty username and password fields by default', () => {
        render(<Login isOpen={true} onClose={jest.fn()} />);
    
        const usernameInput = screen.getByPlaceholderText('Enter username');
        const passwordInput = screen.getByPlaceholderText('Enter password');
    
        expect(usernameInput.value).toBe('');
        expect(passwordInput.value).toBe('');
    });
    
});
