import React from 'react';
import { Navbar } from '../components/Navbar';
import AuthSectionOne from '../components/ui/auth-section-1';
import Footer from '../components/Footer';

export default function Register() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      <Navbar />
      <div className="pt-24 pb-16 flex-1 flex items-center justify-center">
        <AuthSectionOne initialMode="register" />
      </div>
      <Footer />
    </div>
  );
}

export { Register };
