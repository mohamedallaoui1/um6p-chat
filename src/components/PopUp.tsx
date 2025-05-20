import Chat from './Chat'
import React, { useState } from 'react'
import { useEffect } from 'react'
import ChatPopupAnimation from './ChatPopupAnimation';
import { Divide } from 'lucide-react';

function PopUp() {
    return <div className="select-none"><ChatPopupAnimation /></div>;
}

export default PopUp;