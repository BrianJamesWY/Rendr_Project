import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ShowcaseUI from '../components/ShowcaseUI';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Social media platform icons and colors
const SOCIAL_PLATFORMS = {
  instagram: { icon: '📷', color: '#E4405F', label: 'Instagram' },
  tiktok: { icon: '🎵', color: '#000000', label: 'TikTok' },
  youtube: { icon: '▶️', color: '#FF0000', label: 'YouTube' },
  twitter: { icon: '🐦', color: '#1DA1F2', label: 'Twitter/X' },
  facebook: { icon: '👥', color: '#1877F2', label: 'Facebook' },
};

function Showcase() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showcaseFolders, setShowcaseFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username) {
      loadShowcase();
      trackPageView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const trackPageView = async () => {
    try {
      const cleanUsername = username.replace(/^@/, '');
      await axios.post(
        `${BACKEND_URL}/api/analytics/track/page-view`,
        null,
        {
          params: { username: cleanUsername },
        }
      );
    } catch (err) {
      console.log('Analytics tracking failed');
    }
  };

  const trackSocialClick = async (platform) => {
    try {
      const cleanUsername = username.replace(/^@/, '');
      await axios.post(
        `${BACKEND_URL}/api/analytics/track/social-click`,
        null,
        {
          params: { username: cleanUsername, platform },
        }
      );
    } catch (err) {
      console.log('Analytics tracking failed');
    }
  };

  const loadShowcase = async () => {
    try {
      setLoading(true);

      const cleanUsername = username.replace(/^@/, '');

      const profileRes = await axios.get(
        `${BACKEND_URL}/api/@/${cleanUsername}`
      );
      setProfile(profileRes.data);

      const videosRes = await axios.get(
        `${BACKEND_URL}/api/@/${cleanUsername}/videos`
      );
      setVideos(videosRes.data);

      try {
        const foldersRes = await axios.get(
          `${BACKEND_URL}/api/@/${cleanUsername}/showcase-folders`
        );
        setShowcaseFolders(foldersRes.data || []);
      } catch (folderErr) {
        console.log('No showcase folders loaded');
        setShowcaseFolders([]);
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Creator not found');
      setLoading(false);
    }
  };

  // Group videos by showcase folders (public only)
  const groupedVideos = {};
  const publicFolders = showcaseFolders.filter(
    (folder) => folder.is_public !== false
  );

  publicFolders.forEach((folder) => {
    groupedVideos[folder.folder_id] = {
      folderName: folder.folder_name,
      description: folder.description,
      icon_emoji: folder.icon_emoji,
      color: folder.color,
      videos: [],
    };
  });

  videos.forEach((video) => {
    if (
      video.showcase_folder_id &&
      groupedVideos[video.showcase_folder_id]
    ) {
      groupedVideos[video.showcase_folder_id].videos.push(video);
    }
  });

  const collectionLabel = profile?.collection_label || 'Collections';

  return (
    <ShowcaseUI
      BACKEND_URL={BACKEND_URL}
      SOCIAL_PLATFORMS={SOCIAL_PLATFORMS}
      profile={profile}
      videos={videos}
      showcaseFolders={showcaseFolders}
      groupedVideos={groupedVideos}
      loading={loading}
      error={error}
      collectionLabel={collectionLabel}
      onTrackSocialClick={trackSocialClick}
      HomeLinkComponent={Link}
    />
  );
}

export default Showcase;
