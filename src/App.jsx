import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cricket from './pages/Cricket';
import Football from './pages/Football';
import Badminton from './pages/Badminton';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';

function App() {
  return (
    <Web3Provider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow bg-gray-50">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cricket" element={<Cricket />} />
                <Route path="/football" element={<Football />} />
                <Route path="/badminton" element={<Badminton />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </Web3Provider>
  );
}

export default App;