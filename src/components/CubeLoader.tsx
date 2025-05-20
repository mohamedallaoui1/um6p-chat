import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const CubeLoader = () => {
  const cubesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cubesRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(cubesRef.current.children, {
        duration: 0.2,
        scale: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        stagger: {
          each: 0.1,
          from: "random",
        },
      });
    }, cubesRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={cubesRef} className="stagger grid grid-cols-3 w-full h-full">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="cube bg-orange-600"></div>
      ))}
    </div>
  );
};

export default CubeLoader;
