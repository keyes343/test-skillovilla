import React from 'react';
import logo from './logo.svg';
import './App.css';
import Main from './widgets/comments/Main';

function App() {
  return (
    <div >
      <header   >
        <p className="plain_text" style={{maxWidth:'70vw', display:'grid', placeItems:'center center', margin:'auto',  padding:'3rem'}}>
          Comments Widget included below. It can be put anywhere thouughout this app for now.
          For including it in any other website, copy the 'widget' folder inside 'src' or deploy it to npm - registry global library. <br/><br/>


          Pending tasks are - <br/><br/>
          1. Like Button <br/>
          2. Delete Button <br/>
          3. Somethings pending in 'searchbar' <br/> <br/>

          Did not get time to finish these.
        </p>
        <Main /> 
      </header>
    </div>
  );
}

export default App;
