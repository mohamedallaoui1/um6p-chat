import { useState } from "react";
import logoum6p from "../assets/logoum6p.png";
import { TfiMenu } from "react-icons/tfi";
import HoverSidebar from "./HoverSideBar";


const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <aside>
      {/* <div className="fixed w-[18rem] bottom-0 left-0 top-0 px-3 pb-4 pt-2.5 pointer-events-none">
        <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-r from-bg-500/40 to-bg-500/0 to-[80%] \
        transition-opacity opacity-0 transform translate-x-0 translate-y-0 backface-hidden max-md:hidden"></div>
      </div>
      <div className="flex  pt-6 ml-2 ">
        {isMenuOpen && (
          <img src={logoum6p} alt="UM6P Logo" className="ml-2 h-8  pr-1 " />
        )}
        <TfiMenu className= "cursor-pointer ml-6 size-5 " onClick={toggleMenu} />

      </div> */}

      <HoverSidebar />

      {/* The rest */}
    </aside>
  );
};

export default Sidebar;
