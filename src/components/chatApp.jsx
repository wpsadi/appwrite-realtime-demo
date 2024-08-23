// ChatApp.jsx
"use client"
import client, { db, dbId, messageCollectionId } from '@/appwriteConfig';
import React, { useState, useRef, useEffect } from 'react';
import { IoTrashBin } from "react-icons/io5";
import { NameGen as randomName } from "@/helper/randomeName";
import { ID } from 'appwrite';

const ChatApp = () => {
  const [user, setUser] = useState(randomName);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    const unsubscribe = client.subscribe('documents', (response) => {
      if (response.events.includes("databases.*.collections.*.documents.*.create")) {
        if (response.payload.name !== user) {
          addMessage(response.payload.message, response.payload.name, response.payload.$id);
        }
      }

      if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
        removeMessageById(response.payload.$id);
      }
    });

    return () => unsubscribe(); // Clean up the subscription on component unmount
  }, [user]);

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom whenever messages change
  }, [messages]);

  const fetchMessages = async () => {
    const resp = await db.listDocuments(dbId, messageCollectionId);
    const fetchedMessages = resp.documents.map(doc => ({
      text: doc.message,
      direction: doc.name === user ? 'sent' : 'received',
      name: doc.name,
      id: doc.$id,
    }));
    setMessages(fetchedMessages);
  };

  const addMessage = (text, name, id) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { text, direction: name === user ? 'sent' : 'received', name, id }
    ]);
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessage = {
        message: input.trim(),
        name: user,
      };
      const newDoc = await db.createDocument(dbId, messageCollectionId, ID.unique(), newMessage);
      addMessage(newMessage.message, user, newDoc.$id);
      setInput('');
      inputRef.current.focus(); // Refocus the input field
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default Enter key behavior
      await handleSendMessage();
    }
  };

  const handleClick = () => {
    // Focus input field when clicking anywhere else in the chat area
    if (document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  };

  const removeMessageById = (id) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== id));
  };

  const handleDeleteMessage = async (index) => {
    const messageId = messages[index].id;
    removeMessageById(messageId);
    try {
      await db.deleteDocument(dbId, messageCollectionId, messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full mx-auto p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto mb-[80px]"> {/* Adjust the margin-bottom to account for the fixed input area */}
        {messages.map((msg, index) => (
          <div
            key={msg.id} // Use message ID as the key
            className="relative flex flex-col mb-2 group"
          >
            <div className={`text-xs font-semibold ${msg.direction === 'sent' ? 'text-blue-600 text-end' : 'text-gray-600'}`}>
              {msg.name}
            </div>
            <div
              className={`flex-1 ${msg.direction === 'sent' ? 'justify-end' : 'justify-start'} flex items-start mt-1 mb-3`}
            >
              <div
                className={`p-3 rounded-lg text-white ${msg.direction === 'sent' ? 'bg-blue-500' : 'bg-gray-500'}`}
              >
                {msg.text}
              </div>
            </div>
            {
              msg.direction === 'sent' ? (
                <div
                  className="absolute top-0 left-0 mt-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleDeleteMessage(index)}
                >
                  <IoTrashBin className="text-red-500" />
                </div>
              ) : (
                <div
                  className="absolute top-0 right-0 mt-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleDeleteMessage(index)}
                >
                  <IoTrashBin className="text-red-500" />
                </div>
              )
            }
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* This div is used for scrolling */}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 flex items-center border-t"> {/* Fixed at the bottom */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg mr-2"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
