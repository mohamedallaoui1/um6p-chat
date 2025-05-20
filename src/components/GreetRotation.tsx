import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

const AidaGreetRotation: React.FC = () => {
  const dataArray = [
    "UM6P",
    "ABS",
    "EMINES",
    "FGSES",
    "FMS",
    "GTI",
    "1337",
    "SHBM",
    "SAP+D"
  ];

  const schoolNameRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    let index = 0;
    let tl = gsap.timeline({ repeat: -1 });

    const animateText = () => {
      const currentWord = dataArray[index];
      tl.kill();
      tl = gsap.timeline();
      tl.to(schoolNameRef.current, {
        duration: currentWord.length * 0.1,
        text: currentWord,
        ease: "none",
      });
      tl.to({}, { duration: 1 });
      tl.to(schoolNameRef.current, {
        duration: currentWord.length * 0.1,
        text: "",
        ease: "none",
        onComplete: () => {
          index = (index + 1) % dataArray.length;
          animateText();
        },
      });
    };

    animateText();

    return () => {
      tl.kill();
      console.log("Animation killed");
    };
  }, []);

  return (
    <>
      <div> 
        Hey I'm Your Ai Assistant, 
        <div className='text-2xl pl-5'>
          Ask Me About <span ref={schoolNameRef}></span>
        </div>
      </div>
    </>
  );
};

export default AidaGreetRotation;
