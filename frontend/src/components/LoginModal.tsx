import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }

    try {
      let success = false;
      if (isLogin) {
        success = await login(username, password);
        if (!success) {
          setError('Invalid username or password');
        }
      } else {
        success = await signup(username, password, name);
        if (!success) {
          setError('Username already exists');
        }
      }

      if (success) {
        onClose();
        setUsername('');
        setPassword('');
        setName('');
        setError('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-black border border-white p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-medium text-white mb-6 tracking-wide">
          {isLogin ? 'LOGIN' : 'SIGN UP'}
        </h2>

        {/* Demo credentials info */}
        {isLogin && (
          <div className="mb-4 p-3 bg-white/5 border border-white/20 text-white/70 text-sm">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>Username: ava.kim</p>
            <p>Password: password123</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-white/80 text-sm mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-white/30 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-white/80 text-sm mb-2 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-white/30 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/30 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black py-3 px-6 font-medium uppercase tracking-wide hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-white/60 hover:text-white text-sm uppercase tracking-wide"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
