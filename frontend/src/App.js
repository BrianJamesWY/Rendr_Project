import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Verify from "./pages/Verify";
import Upload from "./pages/Upload";
import Showcase from "./pages/Showcase";
import CreatorLogin from "./pages/CreatorLogin";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Admin from "./pages/Admin";
import ShowcaseEditor from "./pages/ShowcaseEditor";
import ProfileSettings from "./pages/ProfileSettings";
import Logo from "./components/Logo";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem'
    }}>
      <Logo size="large" />
      
      <div style={{ 
        maxWidth: '600px', 
        textAlign: 'center',
        marginTop: '2rem'
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '1rem'
        }}>
          Welcome to Rendr
        </h2>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Revolutionary video verification platform using blockchain technology to authenticate content and detect tampering.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/CreatorLogin"
            style={{
              padding: '0.875rem 1.5rem',
              background: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
            }}
          >
            Creator Login
          </a>
          
          <a 
            href="/verify"
            style={{
              padding: '0.875rem 1.5rem',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              border: '2px solid #667eea'
            }}
          >
            Verify Video
          </a>
          
          <a 
            href="/upload"
            style={{
              padding: '0.875rem 1.5rem',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              border: '2px solid #667eea'
            }}
          >
            Upload Video
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/verify" element={<Verify />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/CreatorLogin" element={<CreatorLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/showcase-editor" element={<ShowcaseEditor />} />
          <Route path="/settings" element={<ProfileSettings />} />
          <Route path="/@:username" element={<Showcase />} />
          <Route path="/:username" element={<Showcase />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
