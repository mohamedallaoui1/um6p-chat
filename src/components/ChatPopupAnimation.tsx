import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import Chat from './Chat';
import { BsChatDots } from 'react-icons/bs';
import { IoIosArrowDown } from 'react-icons/io';

const ChatPopupAnimation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  const [showOverlayText, setShowOverlayText] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const getResponsiveStyles = () => {
    const isMobile = window.innerWidth < 640;
    return {
      width: isMobile ? '100%' : '400px',
      height: isMobile ? '100%' : '600px',
      right: isMobile ? '0' : '20px',
    };
  };

  const playIntroAnimation = (onComplete: () => void) => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    setShowOverlayText('Hello, I am your AI assistant!');

    gsap.set(overlay, {
      opacity: 0,
      scale: 0.95,
      display: 'flex',
    });

    gsap.timeline({
      onComplete: () => {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            setShowOverlayText(null);
            gsap.set(overlay, { display: 'none' });

            // Fade in chat container
            const chatContainer = chatContainerRef.current;
            if (chatContainer) {
              gsap.fromTo(
                chatContainer,
                { opacity: 0 },
                {
                  opacity: 1,
                  duration: 0.5,
                  ease: 'power2.out',
                  onComplete: () => setIsAnimationComplete(true),
                }
              );
            } else {
              setIsAnimationComplete(true);
            }

            onComplete();
          },
        });
      },
    })
      .to(overlay, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
      })
      .to(overlay, { delay: 1.2 }); // display message time
  };

  const openChat = () => {
    const container = containerRef.current;
    if (!container || isAnimating) return;

    setIsAnimating(true);
    setIsOpen(true);
    setIsAnimationComplete(false);

    const { width, height, right } = getResponsiveStyles();

    gsap.timeline({
      onComplete: () => {
        playIntroAnimation(() => {
          setIsAnimating(false);
        });
      },
    })
      .to(container, { bottom: 0, duration: 0.3, ease: 'power2.inOut' })
      .to(container, {
        width,
        right,
        borderRadius: '12px 12px 0 0',
        duration: 0.4,
        ease: 'power2.inOut',
      })
      .to(container, {
        height,
        duration: 0.5,
        ease: 'power2.inOut',
      });
  };

  const playOutroAnimation = (onComplete: () => void) => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    setShowOverlayText('Goodbye 👋');

    gsap.set(overlay, {
      opacity: 0,
      scale: 0.95,
      display: 'flex',
    });

    gsap.timeline({
      onComplete: () => {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            setShowOverlayText(null);
            gsap.set(overlay, { display: 'none' });
            onComplete();
          },
        });
      },
    }).to(overlay, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'power2.out',
    }).to(overlay, { delay: 1.2 });
  };

  const closeChat = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const container = containerRef.current;
    const chatContainer = chatContainerRef.current;
    if (!container || isAnimating) return;

    setIsAnimating(true);
    setIsAnimationComplete(false);

    // First fade out chat container
    if (chatContainer) {
      gsap.to(chatContainer, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          playOutroAnimation(() => {
            gsap.timeline({ 
              onComplete: () => {
                // Reset chat container opacity for next opening
                gsap.set(chatContainer, { opacity: 1 });
                
                // Ensure container is fully visible and reset any lingering properties
                gsap.set(container, { 
                  opacity: 1, 
                  visibility: 'visible',
                  display: 'block'
                });
                setIsOpen(false);
                setIsAnimating(false);
              }
            })
              .to(container, { 
                height: '50px', 
                duration: 0.4, 
                ease: 'power2.inOut' 
              })
              .to(container, {
                width: '40px',
                right: '0px',
                borderRadius: '30px 0 0 30px',
                duration: 0.4,
                ease: 'power2.inOut',
              })
              .to(container, { 
                bottom: '20px', 
                duration: 0.3, 
                ease: 'power2.inOut' 
              });
          });
        }
      });
    } else {
      playOutroAnimation(() => {
        gsap.timeline({ 
          onComplete: () => {
            // Ensure container is fully visible and reset any lingering properties
            gsap.set(container, { 
              opacity: 1, 
              visibility: 'visible',
              display: 'block'
            });
            setIsOpen(false);
            setIsAnimating(false);
          }
        })
          .to(container, { 
            height: '50px', 
            duration: 0.4, 
            ease: 'power2.inOut' 
          })
          .to(container, {
            width: '40px',
            right: '0px',
            borderRadius: '30px 0 0 30px',
            duration: 0.4,
            ease: 'power2.inOut',
          })
          .to(container, { 
            bottom: '20px', 
            duration: 0.3, 
            ease: 'power2.inOut' 
          });
      });
    }
  }, [isAnimating]);

  const applyInitialStyles = () => {
    const container = containerRef.current;
    if (!container) return;

    gsap.set(container, {
      width: '40px',
      height: '50px',
      position: 'fixed',
      bottom: '20px',
      right: '0px',  // Consistent with final position
      borderRadius: '30px 0 0 30px',
      backgroundColor: '#ea580c',
      cursor: 'pointer',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      opacity: 1,
      visibility: 'visible',
      display: 'block'
    });
  };

  const handleResize = useCallback(() => {
    const container = containerRef.current;
    if (!container || !isOpen) return;

    const { width, height, right } = getResponsiveStyles();
    gsap.set(container, { width, height, right });
  }, [isOpen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    applyInitialStyles();

    const handleClick = () => {
      if (!isOpen) openChat();
    };

    container.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, handleResize]);

  return (
    <div ref={containerRef} className="z-50">
      <div className="w-full h-full relative bg-orange-600">
        {/* Overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-orange-500/90 flex items-center justify-center z-30 backdrop-blur-sm"
          style={{ display: 'none', borderRadius: 'inherit' }}
        >
          <p className="text-white text-lg sm:text-xl font-medium text-center px-4 leading-relaxed">
            {showOverlayText}
          </p>
        </div>

        {isOpen ? (
          <div
            ref={chatContainerRef}
            className="absolute inset-0 bg-[#efebdd] overflow-hidden z-10 opacity-0 chat-container"
            style={{ borderRadius: 'inherit' }}
          >
            {isAnimationComplete && (
              <>
                <div className="absolute top-2 left-4 z-10">
                  <button
                    className={`close-button ${
                      hasMessages ? 'text-orange-600' : 'text-[#F0EBDD]'
                    } hover:text-orange-700 transition-colors cursor-pointer`}
                    onClick={closeChat}
                  >
                    <IoIosArrowDown size={24} />
                  </button>
                </div>
                
                <Chat onMessageChange={setHasMessages} />
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center cursor-pointer bg-orange-600" style={{borderRadius: '30px 0 0 30px'}}>
            <BsChatDots className="text-white text-2xl" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPopupAnimation;
