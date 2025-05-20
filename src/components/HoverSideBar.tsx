import React, { useState, useEffect, useRef } from 'react';
import logoum6p from "../assets/logoum6p.png";
import gsap from "gsap";
import { FiSidebar } from "react-icons/fi";
import { SidebarIcon } from 'lucide-react';

const HoverSidebar: React.FC = () => {
  const [gradientOpacity, setGradientOpacity] = useState<number>(0);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [showSidebarIcon, setShowSidebarIcon] = useState<boolean>(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const sidebarIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial setup - ensure sidebar starts hidden
    gsap.set(sidebarRef.current, {
      x: '-14rem'
    });
  }, []);

  useEffect(() => {
    // Animate the sidebar when showSidebar changes
    gsap.to(sidebarRef.current, {
      x: showSidebar ? '0' : '-14rem',
      opacity: showSidebar ? 1 : 0,
      duration: 0.4,
      ease: "power3.out" // This gives the bounce effect
    });
  }, [showSidebar]);

  useEffect(() => {
    // Update gradient opacity using GSAP
    gsap.to(gradientRef.current, {
      opacity: showSidebar ? 0 : gradientOpacity,
      duration: 0.3,
      ease: "power3.out"
    });
  }, [gradientOpacity, showSidebar]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      const posX = e.clientX;

      if (posX < 400) {
        const opacity = 1 - (posX / 400);
        setGradientOpacity(opacity);
      } else {
        setGradientOpacity(0);
      }

      if (posX < 40) {
        setShowSidebar(true);
        setShowSidebarIcon(false);
      } else if (posX > 225) {
        setShowSidebar(false);
        setShowSidebarIcon(true);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (showSidebarIcon) {
      gsap.to(sidebarIconRef.current, { opacity: 1, duration: 0.5 });
    } else {
      gsap.to(sidebarIconRef.current, { opacity: 0, duration: 0.5 });
    }
  }, [showSidebarIcon]);

  return (
    <div className="relative h-screen">
      {/* Gradient hover effect - orange to transparent */}
      <div 
        ref={gradientRef}
        className="fixed left-0 top-0 h-full bg-gradient-to-r from-orange-500/25 \
        to-transparent to-100% max-md:hidden"
        style={{
          width: '14rem',
          transform: 'translate3d(0px, 0px, 0px)',
          backfaceVisibility: 'hidden',
          pointerEvents: 'none'
        }}
      ></div>
      
      {/* sidebar */}
      <div 
        ref={sidebarRef}
        className="fixed left-0 top-0 h-full rounded-r-3xl backdrop-blur-sm  shadow-lg max-md:hidden"
        style={{
          width: '14rem'
        }}
      >
        {/* Sidebar content */}
        <div className="p-4">
          <div className="flex pt-6 ml-2">
            <img src={logoum6p} alt="UM6P Logo" className="h-7 pr-1 " />
            <div />
          </div> 
        </div>
      </div>

      { /* sidebar icon */}
      {showSidebarIcon &&
        <div
          ref={sidebarIconRef}
          className="absolute text-xl text-orange-400 left-5 bottom-5 max-md:hidden"
          style={{ opacity: 0 }}
        >
          <FiSidebar />
        </div>
      }
    </div>
  );
};

export default HoverSidebar;