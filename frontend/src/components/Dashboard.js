// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const createDocument = async () => {
    if (!newDocName.trim()) {
      alert('Please enter a document name');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8081/api/documents', {
        name: newDocName,
        content: '// Start coding here...\nfunction hello() {\n  console.log("Hello CodeCraft!");\n}'
      });
      
      setDocuments([...documents, response.data]);
      setNewDocName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Error creating document');
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (documentId) => {
    navigate(`/editor/${documentId}`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📚 CodeCraft Dashboard</h1>
        <div className="navbar">
          <div className="user-badge">
            <div className="avatar">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span>{user?.username || 'User'}</span>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            + New Document
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="create-form fade-in">
          <input
            type="text"
            placeholder="Document name"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createDocument()}
          />
          <button 
            className="btn btn-primary" 
            onClick={createDocument}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => setShowCreateForm(false)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="documents-grid">
        {documents.map(doc => (
          <div key={doc.id} className="document-card fade-in">
            <h3>{doc.name}</h3>
            <p>Created: {new Date(doc.createdAt).toLocaleDateString()}</p>
            <div className="meta">
              <span>📄 JavaScript</span>
              <div className="btn-group">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEditor(doc.id)}
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;