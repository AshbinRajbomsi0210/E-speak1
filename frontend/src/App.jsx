import React from "react";
import Routes from "./Routes";
import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton, RedirectToSignIn } from '@clerk/clerk-react';




function App() {
  return (
    <div>
      
      <Routes />
    </div>   
    
  );
}

export default App;
