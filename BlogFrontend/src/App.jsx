import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import WriteBlog from './pages/WriteBlog';
import Myblogs from './pages/Myblog';
import ScrollToTop from './components/ScrollToTop';
import Allblogs from './pages/Allblogs';
import Chat from './pages/Chat';
import CollaborativeBlogEdit from './pages/CollaborativeBlogEdit';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
      setIsLoggedIn(true);
      setUsername(user.username || user.email || 'User');
    }
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1f2937', color: '#fff' },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#f0fdf4' },
              },
            }}
          />
          <div className="flex flex-col min-h-screen">
            <Navbar isLoggedIn={isLoggedIn} username={username} />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route
                  path="/login"
                  element={
                    <Login
                      setIsLoggedIn={setIsLoggedIn}
                      setUsername={setUsername}
                    />
                  }
                />
                <Route path="/contact" element={<Contact />} />
                <Route path="/writeblog" element={<WriteBlog />} />
                <Route path="/allblog" element={<Allblogs />} />
                <Route path="/myblogs" element={<Myblogs />} />
                <Route path="/edit-blog/:id" element={<CollaborativeBlogEdit />} />
                <Route path="/register" element={<Register />} />
                <Route path="/chat" element={<Chat />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;