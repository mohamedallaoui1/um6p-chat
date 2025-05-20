import { useEffect } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

const AidaGreet = () => {
  useEffect(() => {
    const target = document.querySelector('.aida-greet');
    if (!target) return;

    const text = target.innerText;
    target.innerText = '';

    gsap.to(target, {
      duration: text.length * 0.05,
      text: text,
      ease: 'power1.inOut',
      delay: 0.5,
    });
  }, []);

  return (
    <h1 className="text-3xl text-gray-800 mb-3 aida-greet">
      Hey I'm AIDA, how can I help you?
    </h1>
  );
};

export default AidaGreet;
