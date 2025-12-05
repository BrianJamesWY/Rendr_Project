import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function DirectoryTree({ 
  username, 
  selectedItemId, 
  onItemSelect, 
  onTreeUpdate,
  showLayoutToggle = true,
  containerHeight = '400px'
}) {
  const [tree, setTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [layout, setLayout] = useState('vertical'); // 'vertical' or 'horizontal'
  const [draggedItem, setDraggedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadDirectoryTree();
  }, [username]);

  const loadDirectoryTree = async () => {
    try {
      setLoading(true);
      
      // Load folders
      const foldersRes = await axios.get(`${BACKEND_URL}/api/folders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Load videos
      const videosRes = await axios.get(`${BACKEND_URL}/api/videos/user/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Build tree structure
      const folders = foldersRes.data || [];
      const videos = videosRes.data || [];
      
      // Create "To Be Sorted" default folder
      const toBeSorted = {
        id: 'to-be-sorted',
        name: 'To Be Sorted',
        type: 'folder',
        children: [],
        isDefault: true
      };
      
      // Map folders
      const folderMap = {};
      folders.forEach(folder => {
        folderMap[folder.folder_id] = {
          id: folder.folder_id,
          name: folder.folder_name,
          description: folder.description || '',
          type: 'folder',
          children: [],
          thumbnail: folder.thumbnail_url,
          background: folder.background || {},
          parent_id: folder.parent_id
        };
      });
      
      // Add videos to folders
      videos.forEach(video => {
        const videoNode = {
          id: video.video_id,
          name: video.title || video.verification_code,
          description: video.description || '',
          type: 'video',
          verification_code: video.verification_code,
          thumbnail: video.thumbnail_url
        };
        
        if (video.folder_id && folderMap[video.folder_id]) {
          folderMap[video.folder_id].children.push(videoNode);
        } else {
          toBeSorted.children.push(videoNode);
        }
      });
      
      // Build root level folders (no parent)
      const rootFolders = [];
      Object.values(folderMap).forEach(folder => {
        if (!folder.parent_id) {
          rootFolders.push(folder);
        } else if (folderMap[folder.parent_id]) {
          folderMap[folder.parent_id].children.push(folder);
        }
      });
      
      // Add social media folders
      const socialPlatforms = ['youtube', 'facebook', 'twitter', 'instagram', 'tiktok', 'linkedin'];
      socialPlatforms.forEach(platform => {
        const platformVideos = videos.filter(v => 
          v.social_folders && v.social_folders.includes(platform)
        );
        
        if (platformVideos.length > 0) {
          rootFolders.push({
            id: `social-${platform}`,
            name: platform.charAt(0).toUpperCase() + platform.slice(1),
            type: 'folder',
            isSocial: true,
            children: platformVideos.map(v => ({
              id: v.video_id,
              name: v.title || v.verification_code,
              type: 'video',
              verification_code: v.verification_code,
              thumbnail: v.thumbnail_url
            }))
          });
        }
      });
      
      // Add "To Be Sorted" if it has children
      if (toBeSorted.children.length > 0) {
        rootFolders.unshift(toBeSorted);
      }
      
      setTree(rootFolders);
      setLoading(false);
    } catch (error) {
      console.error('Error loading directory tree:', error);
      setLoading(false);
    }
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetFolder) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem.id === targetFolder.id) {
      return;
    }
    
    try {
      if (draggedItem.type === 'video') {
        // Move video to folder
        await axios.put(
          `${BACKEND_URL}/api/videos/${draggedItem.id}`,
          { folder_id: targetFolder.id === 'to-be-sorted' ? null : targetFolder.id },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else if (draggedItem.type === 'folder') {
        // Move folder into folder (update parent_id)
        await axios.put(
          `${BACKEND_URL}/api/folders/${draggedItem.id}`,
          { parent_id: targetFolder.id === 'to-be-sorted' ? null : targetFolder.id },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }
      
      // Reload tree
      await loadDirectoryTree();
      if (onTreeUpdate) onTreeUpdate();
    } catch (error) {
      console.error('Error moving item:', error);
    }
    
    setDraggedItem(null);
  };

  const renderTreeNode = (node, level = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedItemId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    
    const indent = level * 20;
    
    return (
      <div key={node.id} style={{ marginLeft: layout === 'vertical' ? `${indent}px` : '0' }}>
        <div
          draggable={!node.isDefault && !node.isSocial}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={node.type === 'folder' ? handleDragOver : null}
          onDrop={node.type === 'folder' ? (e) => handleDrop(e, node) : null}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.id);
            }
            if (onItemSelect) onItemSelect(node);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 8px',
            cursor: 'pointer',
            background: isSelected ? '#f0f0ff' : 'transparent',
            border: isSelected ? '2px solid #667eea' : '2px solid transparent',
            borderRadius: '4px',
            marginBottom: '2px',
            transition: 'all 0.2s',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) e.currentTarget.style.background = '#f9f9f9';
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.currentTarget.style.background = 'transparent';
          }}
        >
          {/* Expand/Collapse Icon */}
          {node.type === 'folder' && hasChildren && (
            <span style={{ marginRight: '6px', fontSize: '12px', width: '16px' }}>
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          
          {/* Icon */}
          <span style={{ marginRight: '8px', fontSize: '16px' }}>
            {node.type === 'folder' ? '📁' : '🎬'}
          </span>
          
          {/* Name */}
          <span style={{ 
            fontSize: '14px', 
            fontWeight: isSelected ? '600' : '400',
            color: node.isDefault ? '#888' : '#333',
            flex: 1
          }}>
            {node.name}
          </span>
          
          {/* Verification Code for videos */}
          {node.type === 'video' && node.verification_code && (
            <span style={{ 
              fontSize: '11px', 
              color: '#667eea', 
              fontFamily: 'monospace',
              marginLeft: '8px'
            }}>
              {node.verification_code}
            </span>
          )}
        </div>
        
        {/* Children */}
        {node.type === 'folder' && isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#888',
        height: containerHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading directory...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Layout Toggle */}
      {showLayoutToggle && (
        <div style={{ 
          position: 'absolute', 
          left: '-40px', 
          top: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={() => setLayout('vertical')}
            style={{
              padding: '6px',
              background: layout === 'vertical' ? '#667eea' : '#f0f0f0',
              color: layout === 'vertical' ? 'white' : '#666',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Top to Bottom"
          >
            ↓
          </button>
          <button
            onClick={() => setLayout('horizontal')}
            style={{
              padding: '6px',
              background: layout === 'horizontal' ? '#667eea' : '#f0f0f0',
              color: layout === 'horizontal' ? 'white' : '#666',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Left to Right"
          >
            →
          </button>
        </div>
      )}
      
      {/* Tree Content */}
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px',
        background: '#fafafa',
        minHeight: containerHeight,
        maxHeight: containerHeight,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {tree.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#888', 
            padding: '40px 20px' 
          }}>
            No folders or videos yet. Upload your first video!
          </div>
        ) : (
          tree.map(node => renderTreeNode(node, 0))
        )}
      </div>
    </div>
  );
}

export default DirectoryTree;
