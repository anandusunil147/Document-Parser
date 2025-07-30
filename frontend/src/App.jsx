import React, { useState } from 'react';
import axios from 'axios';
import "./App.css";

const styles = {
  backgroundImage: `url('/bac.avif')`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  minHeight: '100vh',
  height: '100%',
};

function App() {
  const [file, setFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidFileType = (file) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    return allowedTypes.includes(file.type);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || !isValidFileType(selectedFile)) {
      alert("Only PDF and image files (.jpg, .jpeg, .png) are allowed.");
      return;
    }
    setFile(selectedFile);
    setUploadedFileUrl(URL.createObjectURL(selectedFile));
    setAnswer('');
  };

  const uploadInvoice = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('http://localhost:8000/upload/', formData);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    }
    setLoading(false);
  };

  const askQuestion = async () => {
    if (!question) return;
    try {
      const res = await axios.post('http://localhost:8000/ask/', {
        question: question
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error('Question error:', err);
      alert('Could not get an answer. Please check console or try again.');
    }
  };

  return (
    <div className="App max-w-3xl mx-auto p-4" style={styles}>
      <h1 className="container">Document Parser with Chatbot</h1>

      <div className="upload-container">
        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
        <button onClick={uploadInvoice} className="button" disabled={loading}>
          Upload
        </button>
      </div>

      {uploadedFileUrl && (
        <div className="mt-4">
          <h2 className="font-semibold">Uploaded File Preview:</h2>
          {file?.type.startsWith('image/') ? (
            <img
              src={uploadedFileUrl}
              alt="Uploaded preview"
              className="max-w-full h-auto mt-2 rounded shadow"
              style={{ maxHeight: '400px' }}
            />
          ) : (
            <p className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mt-2">
              PDF file uploaded: {file.name}
            </p>
          )}
        </div>
      )}

      {loading && <p className="mt-4 text-yellow-600">Processing...</p>}

      {file && (
        <div className="chat input mt-6">
          <h2 className="text-lg font-semibold">Ask a Question:</h2>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about the file"
            className="w-full p-2 border rounded mt-2"
          />
          <button
            onClick={askQuestion}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
          >
            Ask
          </button>
          {answer && (
            <div className="answer mt-2">
              <h3 className="font-semibold">Answer:</h3>
              <p className="bg-gray-50 p-2 rounded">{answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
