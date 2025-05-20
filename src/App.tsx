import React from 'react'
import Sidebar from './components/Sidebar'

import Chat from './components/Chat'
import PopUp from './components/PopUp'

function App() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#333]">
      <main className="flex flex-col justify-center items-center w-full h-full">
        <PopUp />
      </main>
    </div>
  )
}

export default App