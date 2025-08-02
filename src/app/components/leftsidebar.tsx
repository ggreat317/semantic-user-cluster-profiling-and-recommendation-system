export function LeftSidebar() {
  return(
    <div className="messages">
      <Menu></Menu>
      <FocusedMessages></FocusedMessages>
      <Options></Options>
    </div>
  );
}

function Options(){
    return(
        <div className="messages-options">
            <MenuButton name={"Customization"}></MenuButton>
            <MenuButton name={"Settings"}></MenuButton>
        </div>
    );  
}
function FocusedMessages(){
    return(
        <div className="messages-direct">
            <div className="text">Direct Messages</div>
            <div className="text">Group Chats</div>
        </div>
    );
}

function Menu(){
    return(
        <div className="messages-menu">
            <MenuInput></MenuInput>  
            <MenuButton name={"Friends"}></MenuButton>
            <MenuButton name={"Requests"}></MenuButton>
        </div>
    );
}

function MenuInput(){
    return(
        <input className="input menu-input" placeholder="Search..."></input>
    );
}

function MenuButton({name} : any){
    return(
       <button className="button menu-button">{name}</button> 
    );
}
