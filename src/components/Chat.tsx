import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiSend } from "react-icons/fi";
import { BiMessageDetail } from "react-icons/bi";
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { MdOutlineRefresh } from "react-icons/md"; // Added import for the reset icon
import cleverlyticsLogo from "../assets/cleverlyticsLogo.png"
import whiteLogo from "../assets/CleverlyticsLogoWhite.png"
// import AidaGreet from "./Greet.tsx";
import AidaGreetRotation from "./GreetRotation";
import CubeLoader from "./CubeLoader.tsx";
import ShinyText from "./TypingLoading.tsx";
import BotAnswerAnimated from "./BotAnswerAnimated.tsx";
import CubeRotation from "./CubeRotation.tsx";
import gsap from "gsap";
import { FaCirclePlus } from "react-icons/fa6";
import um6pBg from "../assets/um6pBG.svg"
// const API_BASE_URL = "http://localhost:5001";
const API_BASE_URL = "https://bk-chatbot.cleverlytics.site";
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is crucial for sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  }
});

interface Message {
  text: string;
  sender: "user" | "bot";
  reaction?: "like" | "dislike";
  feedback?: string;
}

interface ConversationHistory {
  role: string;
  content: string;
  timestamp: string;
}

console.log("Cookies:", document.cookie);
axiosInstance.interceptors.request.use(request => {
  console.log('Request headers:', request.headers);
  return request;
});

interface ChatProps {
  onMessageChange: (hasMessages: boolean) => void;
}

function Chat({ onMessageChange }: ChatProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    [key: number]: string;
  }>({});
  const [showFeedbackBox, setShowFeedbackBox] = useState<{
    [key: number]: boolean;
  }>({});
  const [feedbackSuccess, setFeedbackSuccess] = useState<{
    [key: number]: boolean;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollToRef = useRef<HTMLDivElement>(null);
  const [TextGeneration, setTextGeneration] = useState(0);
  const questionHoverRef = useRef<HTMLButtonElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);



  // Helper function to check server health
  const checkServerHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data.status === 'healthy';
    } catch (err) {
      return false;
    }
  };

  // Helper function to handle retries
  const retryOperation = async (operation: () => Promise<any>): Promise<any> => {
    try {
      const result = await operation();
      setIsConnected(true);
      setError(null);
      return result;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNREFUSED' || err.response?.status === 503) {
          setIsConnected(false);
        }
      }
      throw err;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        // First check if server is healthy
        const isHealthy = await checkServerHealth();
        if (!isHealthy) {
          throw new Error('Server is not healthy');
        }

        await retryOperation(async () => {
          // Initialize conversation
          const initResponse = await axios.post(`${API_BASE_URL}/conversation/initialize`, {}, {withCredentials:true, headers: { 'Content-Type': 'application/json'}});
          if (initResponse.data.status !== 'success') {
            throw new Error('Failed to initialize conversation');
          }

          // Get conversation history
          const historyResponse = await axios.get(`${API_BASE_URL}/conversation/history`);
          if (historyResponse.data.status !== 'success') {
            throw new Error('Failed to get conversation history');
          }

          const history = historyResponse.data.history as ConversationHistory[];
          const formattedMessages = history.map((msg) => ({
            text: msg.content,
            sender: msg.role === "user" ? "user" : "bot",
          }));
          
          setMessages(formattedMessages);
          setIsConnected(true);
          setError(null);
          return historyResponse;
        });
      } catch (err) {
        setInitializationAttempts(prev => prev + 1);
        let errorMessage = 'Failed to initialize conversation';
        
        if (axios.isAxiosError(err)) {
          if (err.code === 'ECONNREFUSED') {
            errorMessage = 'Unable to connect to the chat service. Please check if the server is running on port 5001.';
          } else if (err.response?.status === 404) {
            errorMessage = 'Chat service endpoints not found. Please check if the server is running correctly.';
          } else if (err.response?.status === 500) {
            errorMessage = 'Server error during initialization. Please check the server logs.';
          } else if (err.response?.status === 503) {
            errorMessage = 'Chat service is currently unavailable. Please try again later.';
          }
        }
        
        setError(errorMessage);
        setIsConnected(false);
        
        // Show a more user-friendly message in the chat
        setMessages([{
          text: "I'm having trouble connecting to the chat service. Please ensure that:\n\n" +
                "1. The Flask server is running on port 5001\n" +
                "2. CORS is properly configured on the server\n" +
                "3. The server is not experiencing any errors",
          sender: "bot"
        }]);
      }
    };

    initialize();
  }, [initializationAttempts]); // Re-run when initialization attempts change

  const handleResetConversation = async () => {
    try {
      setIsLoading(true); // Indicate loading during reset
      setMessages([]); // Immediately clear messages for responsiveness
      setError(null); // Clear previous errors
      
      await retryOperation(async () => {
        const result = await axiosInstance.post(`${API_BASE_URL}/conversation/reset`);
        if (result.data.status !== "success") {
          throw new Error("Failed to reset conversation on server");
        }
        return result;
      });
      
      // Optional: You might want to re-initialize or show a success message
      // For now, it just clears the UI and resets server state.
      // The initial UI will reappear because messages.length is now 0.

    } catch (err) {
      let errorMessage = 'Failed to reset conversation';
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Connection lost. Please check if the server is still running.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error during reset. Please check the server logs.';
        }
      }
      setError(errorMessage);
      // Optionally add a message back to the UI indicating the reset failed
      setMessages([{ text: "Failed to start a new chat. Please try again.", sender: "bot" }]);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const userMessage = inputMessage.trim();
      setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
      setInputMessage("");
      setIsLoading(true);
      setError(null);

      try {
        const response = await retryOperation(async () => {
          const result = await axiosInstance.post(`${API_BASE_URL}/query`, {
            query: userMessage,
          });
          if (result.data.status !== "success") {
            throw new Error("Invalid response from server");
          }
          return result;
        });

        setMessages((prev) => [
          ...prev,
          { text: response.data.response, sender: "bot" },
        ]);
      } catch (err) {
        let errorMessage = 'Failed to get response';
        if (axios.isAxiosError(err)) {
          if (err.code === 'ECONNREFUSED') {
            errorMessage = 'Connection lost. Please check if the server is still running.';
          } else if (err.response?.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          } else if (err.response?.status === 500) {
            errorMessage = 'Server error. Please check the server logs.';
          }
        }
        setError(errorMessage);
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I encountered an error. Please try again.",
            sender: "bot",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReaction = async (index: number, reaction: "like" | "dislike") => {
    try {
      const message = messages[index];
      if (!message || message.sender !== "bot") {
        throw new Error('Invalid message for reaction');
      }

      // Find the corresponding user query
      const userMessage = messages[index - 1];
      if (!userMessage || userMessage.sender !== "user") {
        throw new Error('Could not find corresponding user query');
      }

      await retryOperation(async () => {
        await axios.post(`${API_BASE_URL}/feedbacks/feedback/reaction`, {
          query: userMessage.text,
          response: message.text,
          reaction: reaction === "like" ? "Good" : "Bad"
        });
      });

      // Toggle reaction: if same reaction clicked, remove it; if different reaction, switch to new one
      setMessages((prev) =>
        prev.map((msg, i) => 
          i === index 
            ? { 
                ...msg, 
                reaction: msg.reaction === reaction ? undefined : reaction 
              } 
            : msg
        )
      );
    } catch (err) {
      let errorMessage = 'Failed to submit reaction';
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Connection lost. Unable to save reaction.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Reaction not saved.';
        }
      }
      setError(errorMessage);
    }
  };

  const handleFeedbackChange = (index: number, text: string) => {
    setFeedbackMessage((prev) => ({ ...prev, [index]: text }));
    // Reset success message when user starts typing new feedback
    setFeedbackSuccess((prev) => ({ ...prev, [index]: false }));
  };

  const submitFeedback = async (index: number) => {
    try {
      const message = messages[index];
      if (!message || message.sender !== "bot") {
        throw new Error('Invalid message for feedback');
      }

      // Find the corresponding user query
      const userMessage = messages[index - 1];
      if (!userMessage || userMessage.sender !== "user") {
        throw new Error('Could not find corresponding user query');
      }

      await retryOperation(async () => {
        await axios.post(`${API_BASE_URL}/feedbacks/feedback`, {
          query: userMessage.text,
          response: message.text,
          feedback_text: feedbackMessage[index]
        });
      });

      // Update message and UI state
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === index ? { ...msg, feedback: feedbackMessage[index] } : msg
        )
      );
      
      // Clear feedback input and show success message
      setFeedbackMessage((prev) => ({ ...prev, [index]: "" }));
      setFeedbackSuccess((prev) => ({ ...prev, [index]: true }));
      
      // Hide feedback box after 3 seconds
      setTimeout(() => {
        setFeedbackSuccess((prev) => ({ ...prev, [index]: false }));
        setShowFeedbackBox((prev) => ({ ...prev, [index]: false }));
      }, 3000);

    } catch (err) {
      let errorMessage = 'Failed to submit feedback';
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Connection lost. Unable to save feedback.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Feedback not saved.';
        }
      }
      setError(errorMessage);
    }
  };

  const handleRetryConnection = () => {
    setInitializationAttempts(prev => prev + 1);
  };

  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, TextGeneration])

  // Inside Chat component
  useEffect(() => {
    // Assuming messages is your messages array
    onMessageChange(messages.length > 0);
  }, [messages, onMessageChange]);

  return (
    <>
      {/* Outer container */}
      <div className="h-full w-full flex flex-col overflow-hidden"> {/* Changed overflow-y-auto to overflow-hidden here */}

        {/* --- Sticky Header --- */}
        {messages.length > 0 && (
         <div className="relative w-full h-14 bg-[#efebdd] border-b border-orange-200 flex items-center px-4 flex-shrink-0">
         {/* Logo Centered */}
         <div className="absolute left-1/2 transform -translate-x-1/2 text-gray-700 font-semibold">
            <div className="flex items-center justify-center gap-2">
              {
                ["A", "i"].map((text) => (
                  <div 
                    className="w-7 h-7 text-white bg-orange-600 font-bold flex items-center justify-center"
                    >
                      {text}
                      
                  </div>
                ))}
              </div>
         </div>
       
         {/* New Chat Button (Aligned Right) */}
         <div className="ml-auto relative flex items-center">
           <button
             onClick={handleResetConversation}
             disabled={!isConnected || isLoading || isAnimating}
             className="text-xl hover:scale-105 transition-transform duration-200 text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed p-1 "
             onMouseEnter={(e) => {
               const tooltip = document.getElementById("tooltip");
               if (tooltip) {
                 tooltip.style.top = `${e.clientY + 20}px`;
                 tooltip.style.left = `${e.clientX - 90}px`;
                 tooltip.style.opacity = "1";
               }
             }}
             onMouseLeave={() => {
               const tooltip = document.getElementById("tooltip");
               if (tooltip) tooltip.style.opacity = "0";
             }}
           >
             <FaCirclePlus />
           </button>
         </div>

          <div
              id="tooltip"
              className="fixed px-3 py-1 text-sm text-white bg-orange-600 rounded-sm shadow-lg whitespace-nowrap transition-opacity duration-200 opacity-0 z-50"
              style={{ pointerEvents: "none" }}
            >
              Start New Chat
          </div>
       </div>
       
       
        
        )}
        {/* --- End Sticky Header --- */}


        {/* Chat Container - Now takes remaining space and handles scrolling */}
        <div className="flex-grow flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-transparent cursor-default"> 
          <div className="flex-grow flex justify-center items-start"> 
            <div className="flex justify-center items-start h-full max-w-[40rem] w-full px-4 relative"> 
              {!isConnected && messages.length > 0 && ( // Only show connection error if chat started
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative my-2" role="alert">
                  <span className="block sm:inline">
                    Attempting to connect to the server...
                    <button 
                      onClick={handleRetryConnection}
                      className="ml-4 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Retry Connection
                    </button>
                  </span>
                </div>
              )}
              {error && messages.length > 0 && ( // Only show other errors if chat started
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-2" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              {/* Messages Container */}
              <div 
                ref={messagesContainerRef}
                className="w-full h-full pb-[10px] flex flex-col cursor-default" 
                style={{ 
                  overflowWrap: 'break-word', 
                  wordWrap: 'break-word' 
                }}
              >
                {/* Initial Screen (Only when messages is empty) */}
                {messages.length === 0 && !isLoading && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden">
                      <img 
                        src={um6pBg} 
                        alt="UM6P Background" 
                        className="w-full h-full object-contain bg-orange-600 select-none"
                      />
                      <div className="absolute bottom-0 left-0 w-full pt-4 pl-2">
                        <div className="first-greet text-left text-[#efebdd] w-full">
                            <div className="whitespace-nowrap text-[16px] sm:text-lg md:text[15px] lg:text[15px] xl:text-[14px] text-[#efebdd]">
                                <AidaGreetRotation />
                            </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 p-4 flex gap-3 flex-col justify-center items-start">
                    {["How Can I Apply to this University?", "What Schools Are There In UM6P?", "Where is UM6P Located?"].map((text, index) => (
                      <button 
                      key={index}
                      onClick={handleSubmit}
                      onMouseEnter={() => setInputMessage(text)}
                      onMouseLeave={() => setInputMessage("")}
                      className="question text-[#efebdd] p-2 bg-orange-600 transition-[width] duration-500 ease-in-out w-[300px] max-w-full overflow-hidden hover:w-full text-left" // Added text-left
                      >
                        {text}
                        
                      </button>
                    ))}
                  </div>
                  </>
                )}

                {/* Display Messages */}
                {messages.map((message, index) => {
                  const isLastMessage = index === messages.length - 1;
                  return (
                    <div
                      key={index}
                      className={`flex py-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      // Removed ref={isLastMessage ? messagesContainerRef : null} - scroll handled differently
                    >
                      {message.sender === "bot" && (
                        <div className="h-7 w-7 mt-4 bg-orange-600 flex-shrink-0 mr-2"></div> // Added flex-shrink-0 and margin
                      )}
                      <div
                        className={`max-w-[70%] p-3 rounded-lg whitespace-pre-line break-words ${
                          message.sender === "user" ? "bg-[#F7F7F7] text-black" : "bg-none text-gray-800"
                        }`}
                        style={{ 
                          overflowWrap: 'break-word', 
                          wordWrap: 'break-word' 
                        }}
                      >
                        {message.sender === "bot" ? (

                            <>
                              <BotAnswerAnimated
                              text={message.text}
                              setIsAnimating={setIsAnimating}
                              setTextGeneration={setTextGeneration}
                              />
                            </>
                        ) : (
                          message.text
                        )}
                        {message.sender === "bot" && !isLoading && !isAnimating && ( // Hide reactions while loading/animating next msg
                        <>
                          <div className="flex gap-2 mt-2">
                            <button
                              className={`p-1 transition-colors duration-200 ${
                                message.reaction === "like"
                                  ? "text-[#2785d1] bg-blue-50 rounded"
                                  : "text-gray-500 hover:text-[#2785d1] hover:bg-blue-50 hover:rounded"
                              }`}
                              onClick={() => handleReaction(index, "like")}
                              disabled={!isConnected}
                            >
                              <AiOutlineLike size={20} />
                            </button>
                            <button
                              className={`p-1 transition-colors duration-200 ${
                                message.reaction === "dislike"
                                  ? "text-red-500 bg-red-50 rounded"
                                  : "text-gray-500 hover:text-red-500 hover:bg-red-50 hover:rounded"
                              }`}
                              onClick={() => handleReaction(index, "dislike")}
                              disabled={!isConnected}
                            >
                              <AiOutlineDislike size={20} />
                            </button>
                            <button
                              className="p-1 text-gray-500 flex items-center gap-1 hover:text-[#EF6A36] transition-colors duration-200"
                              onClick={() =>
                                setShowFeedbackBox((prev) => ({
                                  ...prev,
                                  [index]: !prev[index],
                                }))
                              }
                              disabled={!isConnected}
                            >
                              <BiMessageDetail size={18} />
                              <span className="text-sm">Feedback</span>
                            </button>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1 italic whitespace-nowrap">AI assistant may make mistakes.<br/>Please verify answers from trusted sources.</div>
                          </>
                        )}
                        {showFeedbackBox[index] && (
                          <>
                          <div className="mt-2">
                            <textarea
                              className="w-full p-2 border rounded-lg text-sm border-orange-500 focus:outline-none focus:ring-1 focus:ring-[#EF6A36]"
                              placeholder="Write your feedback..."
                              value={feedbackMessage[index] || ""}
                              onChange={(e) => handleFeedbackChange(index, e.target.value)}
                              disabled={!isConnected}
                              />
                            {feedbackSuccess[index] ? (
                              <div className="text-green-600 mt-2">Feedback sent successfully!</div>
                            ) : (
                              <button
                              className="bg-[#EF6A36] text-white px-3 py-1 rounded-lg mt-2 text-sm hover:bg-[#EF6A36] transition disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => submitFeedback(index)}
                              disabled={!isConnected || !feedbackMessage[index]}
                              >
                                Submit Feedback
                              </button>
                            )}
                          </div>
                          </>
                        )}
                      </div>
                      {/* {message.sender === "user" && ( // Spacer for user message alignment if needed
                         <div className="w-7 flex-shrink-0 ml-2"></div>
                      )} */}
                    </div>
                  );
                })}
                
                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex justify-start items-center py-3"> {/* Added items-center */}
                    <div className="mt-3"> {/* Mimic bot icon */}
                       <CubeRotation /> {/* You might want CubeRotation here instead of a static box */}
                    </div>
                    <div className="text-gray-800 p-3"> {/* Adjusted padding */}
                      <ShinyText text="loading..." disabled={false} speed={3} className='custom-class' />
                    </div>
                  </div>
                )}
                {/* ScrollIntoView Target */}
                <div ref={scrollToRef} className="h-1"></div> {/* Simplified scroll target */}
              </div>
            </div>
          </div>
        </div> {/* End Scrollable Chat Area */}


        {/* Input Area (Fixed at Bottom) */}
        {/* Added flex-shrink-0 to prevent shrinking */}
        <div className="input-container w-full px-2 pt-2 bg-orange-600 rounded-sm flex-shrink-0">
          <form onSubmit={handleSubmit} className="w-full pb-2">
            <div className="flex justify-center gap-2">
              {/* Input Field */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Talk with AI Assistant . . ."
                className="overflow-hidden w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#EF6A36] 
                          text-gray-900 disabled:text-[#efebdd] disabled:cursor-not-allowed bg-white disabled:bg-[#e0dacd]"
                disabled={!isConnected || isLoading || isAnimating}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!isConnected || isLoading || isAnimating || inputMessage.trim().length === 0} // Disable if input is empty
                className="bg-orange-900 text-white px-4 py-2 rounded-sm hover:bg-[#EF6A36] transition 
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-orange-800"
              >
                <FiSend />
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <div className="px-4 pb-2 flex justify-center">
            <div className="flex items-center gap-2 text-[#efebdd] text-[10px]">
              <span>Developed by</span>
              <img src={whiteLogo} className="h-5" alt="Cleverlytics Logo" />
            </div>
          </div>
        </div> {/* End Input Area */}


      </div> {/* End Outer Container */}
    </>
  );
}

export default Chat;
