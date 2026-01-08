import React from "react";
import Routes from "./Routes";
import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton, RedirectToSignIn } from '@clerk/clerk-react';
import GlobalChatbot from './components/GlobalChatbot';




function App() {
  return (
    <div>
      
      <Routes />
      <GlobalChatbot />
    </div>   
    
  );
}

export default App;
