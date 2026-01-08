// frontend/src/pages/Settings.js - LOGIC ONLY (Dashboard.js pattern)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SettingsUI from '../components/SettingsUI.jsx';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('rendr_token');

  // ALL YOUR EXISTING LOGIC → IDENTICAL
  useEffect(() => {
    if (!token) return navigate('/CreatorLogin');
    loadProfile();
  }, [token, navigate]);

  const loadProfile = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileRes = await axios.get(`${BACKEND_URL}/api/@/${res.data.username}`);
      
      setUser({
        ...res.data,
        social_media_links: profileRes.data.social_media_links || [],
        dashboard_social_links: res.data.dashboard_social_links || [],
        collection_label: profileRes.data.collection_label || 'Collections'
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setLoading(false);
    }
  };

  const saveProfile = useCallback(async (profileData) => {
    setSaving(true);
    try {
      await axios.put(`${BACKEND_URL}/api/@/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
      loadProfile(); // Refresh
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.detail || 'Unknown error'));
    }
    setSaving(false);
  }, [token]);

  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`${BACKEND_URL}/api/@/upload-profile-picture`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadProfile();
  };

  const uploadBanner = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`${BACKEND_URL}/api/@/upload-banner`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadProfile();
  };

  if (loading) return <SettingsUI loading={true} />;

  return (
    <SettingsUI
      user={user}
      onSave={saveProfile}
      onUploadProfilePicture={uploadProfilePicture}
      onUploadBanner={uploadBanner}
      saving={saving}
      onRefresh={loadProfile}
    />
  );
}

export default Settings;
