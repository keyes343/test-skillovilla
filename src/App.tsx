import React from 'react';
import logo from './logo.svg';
import './App.css';
import Main from './widgets/comments/Main';

function App() {
  return (
    <div >
      <header  >
        <p className="plain_text">
          Comments Widget included below. It can be put anywhere thouughout this app for now.
          For including it in any other website, copy the 'widget' folder inside 'src' or deploy it to npm - registry global library.
        </p>
        <Main /> 
      </header>
    </div>
  );
}

export default App;
