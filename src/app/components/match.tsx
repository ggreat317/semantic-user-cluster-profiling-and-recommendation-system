import { useState } from 'react';

export function Match(){
  const[count, setCount] = useState('0');

  return(
    <div className="match">
      <div className="text big">murmur</div>
      <div className="profiles">
        <Profile></Profile>
        <Profile></Profile>
        <Profile></Profile>
        <Profile></Profile>
        <Profile></Profile>
        <Profile></Profile>
        <Profile></Profile>
        <Profile></Profile>
        <Profile></Profile>
      </div>
    </div>
  );
}

function Profile(){
  const[showMore, setShowMore] = useState(false);

  function handleClick(){
    setShowMore(!showMore);
    }
    
  return(
    <button className="profile" onClick={handleClick}>
      <div className="userinfo">
        <div className="pfp">PH</div>
        <div className="text username">PlaceHolder</div>
      </div>
      {showMore && <div className="aboutme">
        <div className="text small reg">I like daisies and to go on trips with my mum</div>
      </div>}
    </button>
  );
}

function YourInterests(){
  return(
    <div className="profile">
      <div className="text">Interests</div>
    </div>
  );
}

function Interest(){
  return(
    <div className="interests">
    </div>
  );
}

