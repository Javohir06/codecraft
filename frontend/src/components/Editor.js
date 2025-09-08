// Update frontend/src/components/Editor.js
import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useParams } from 'react-router-dom';

const Editor = ({ user }) => {
  const [code, setCode] = useState('// Loading document...\nfunction hello() {\n  console.log("Hello CodeCraft!");\n}');
  const [documentName, setDocumentName] = useState('Untitled Document');
  const [collaborators, setCollaborators] = useState([]);
  const { documentId } = useParams();
  
  const stompClient = useRef(null);
  const currentUserRef = useRef(null);

  // Initialize or retrieve user info
  useEffect(() => {
    // Get or create persistent user info
    const storedUserInfo = localStorage.getItem('codecraft_user');
    if (storedUserInfo) {
      currentUserRef.current = JSON.parse(storedUserInfo);
    } else {
      // Create new user info and store it
      const newUserInfo = {
        userId: 'user_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
        username: 'User' + Math.floor(Math.random() * 1000)
      };
      localStorage.setItem('codecraft_user', JSON.stringify(newUserInfo));
      currentUserRef.current = newUserInfo;
    }
    
    console.log('Current user:', currentUserRef.current);
  }, []);

  useEffect(() => {
    if (documentId && currentUserRef.current) {
      loadDocument(documentId);
      connectWebSocket(documentId);
    }

    return () => {
      if (stompClient.current && stompClient.current.connected) {
        // Send disconnect message
        const disconnectMsg = {
          content: code,
          userId: currentUserRef.current.userId,
          username: currentUserRef.current.username,
          type: 'disconnect'
        };
        stompClient.current.publish({
          destination: `/app/document/${documentId}`,
          body: JSON.stringify(disconnectMsg)
        });
        stompClient.current.deactivate();
      }
    };
  }, [documentId]);

  const loadDocument = async (id) => {
    try {
      setDocumentName('Test Document #' + id);
    } catch (error) {
      console.error('Error loading document:', error);
    }
  };

  const connectWebSocket = (docId) => {
    const client = new Client();
    client.brokerURL = 'ws://localhost:8081/ws/websocket';
    client.debug = (str) => console.log(str);
    
    client.onConnect = () => {
      console.log('Connected to WebSocket as:', currentUserRef.current.username);
      
      // Subscribe to document updates
      client.subscribe(`/topic/document/${docId}`, (message) => {
        try {
          const change = JSON.parse(message.body);
          
          if (change.type === 'disconnect') {
            // Remove disconnected user
            setCollaborators(prev => 
              prev.filter(c => c.userId !== change.userId)
            );
          } else if (change.type === 'connect' || change.type === 'code_change') {
            // Update code (only for code changes)
            if (change.type === 'code_change') {
              setCode(change.content);
            }
            
            // Update collaborators list (exclude current user)
            if (change.userId !== currentUserRef.current.userId) {
              setCollaborators(prev => {
                // Check if user already exists
                const existingIndex = prev.findIndex(c => c.userId === change.userId);
                if (existingIndex >= 0) {
                  // Update existing user
                  const updated = [...prev];
                  updated[existingIndex] = {
                    userId: change.userId,
                    username: change.username
                  };
                  return updated;
                } else if (change.userId && change.username) {
                  // Add new user
                  return [...prev, { userId: change.userId, username: change.username }];
                }
                return prev;
              });
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });
      
      // Send initial connect message
      setTimeout(() => {
        const connectMsg = {
          content: code,
          userId: currentUserRef.current.userId,
          username: currentUserRef.current.username,
          type: 'connect'
        };
        client.publish({
          destination: `/app/document/${docId}`,
          body: JSON.stringify(connectMsg)
        });
      }, 100);
    };
    
    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };
    
    client.activate();
    stompClient.current = client;
  };

  const handleEditorChange = (value) => {
    setCode(value);
    
    // Send change to other collaborators
    if (stompClient.current && stompClient.current.connected) {
      const change = {
        content: value,
        userId: currentUserRef.current.userId,
        username: currentUserRef.current.username,
        type: 'code_change'
      };
      
      stompClient.current.publish({
        destination: `/app/document/${documentId}`,
        body: JSON.stringify(change)
      });
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>📝 {documentName}</h2>
        <div className="collaborators">
          <span>👥 Collaborators: </span>
          {collaborators.length > 0 ? (
            collaborators.map(user => (
              <span key={user.userId} className="collaborator-badge">
                👤 {user.username}
              </span>
            ))
          ) : (
            <span>You're alone</span>
          )}
        </div>
      </div>
      
      <MonacoEditor
        height="70vh"
        language="javascript"
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
      
      <div className="editor-footer">
        <p>You: {currentUserRef.current?.username} | Document ID: {documentId}</p>
      </div>
    </div>
  );
};

export default Editor;