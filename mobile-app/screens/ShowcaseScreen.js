import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function ShowcaseScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const token = await AsyncStorage.getItem('rendr_token');
      const response = await axios.get(`${API_BASE_URL}/videos/user/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Error loading videos:', error);
      Alert.alert('Error', 'Could not load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  const copyVerificationCode = (code) => {
    // For mobile, we'll show alert with code
    Alert.alert(
      'Verification Code',
      code,
      [
        { text: 'OK' }
      ]
    );
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => copyVerificationCode(item.verification_code)}
    >
      {/* Thumbnail */}
      {item.thumbnail_url ? (
        <Image
          source={{ uri: `${API_BASE_URL.replace('/api', '')}${item.thumbnail_url}` }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Text style={styles.thumbnailIcon}>🎬</Text>
        </View>
      )}

      {/* Video Info */}
      <View style={styles.videoInfo}>
        <Text style={styles.verificationCode}>{item.verification_code}</Text>
        <Text style={styles.videoDate}>
          {new Date(item.captured_at).toLocaleDateString()}
        </Text>
        {item.has_blockchain && (
          <View style={styles.blockchainBadge}>
            <Text style={styles.blockchainText}>⛓️ Blockchain</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📹</Text>
        <Text style={styles.emptyTitle}>No Videos Yet</Text>
        <Text style={styles.emptyText}>
          Start recording videos with Rendr Bodycam to build your verified portfolio.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Verified Videos</Text>
        <Text style={styles.headerSubtitle}>{videos.length} total</Text>
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.video_id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  grid: {
    padding: 10,
  },
  videoCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 40,
  },
  videoInfo: {
    padding: 12,
  },
  verificationCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 5,
  },
  videoDate: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 5,
  },
  blockchainBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  blockchainText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
