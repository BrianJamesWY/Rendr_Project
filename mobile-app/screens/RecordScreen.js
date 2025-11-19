import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import * as FileSystem from 'expo-file-system';

export default function RecordScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState('');
  const cameraRef = useRef(null);

  useEffect(() => {
    loadUsername();
  }, []);

  const loadUsername = async () => {
    const user = await AsyncStorage.getItem('rendr_username');
    setUsername(user || 'Creator');
  };

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>📹 Camera Permission</Text>
          <Text style={styles.permissionText}>
            Rendr Bodycam needs camera access to record verified videos.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 300, // 5 minutes max
        quality: '720p'
      });

      // Upload the video
      await uploadVideo(video.uri);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Recording Error', error.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const uploadVideo = async (videoUri) => {
    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('rendr_token');

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      
      // Create form data
      const formData = new FormData();
      formData.append('video_file', {
        uri: videoUri,
        type: 'video/mp4',
        name: `bodycam_${Date.now()}.mp4`
      });
      formData.append('source', 'bodycam');

      const response = await axios.post(
        `${API_BASE_URL}/videos/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      Alert.alert(
        'Success!',
        `Video verified!\n\nCode: ${response.data.verification_code}`,
        [
          {
            text: 'Record Another',
            onPress: () => setUploading(false)
          },
          {
            text: 'View Videos',
            onPress: () => navigation.navigate('Showcase')
          }
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.detail || 'Could not upload video. Please try again.'
      );
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <View style={styles.container}>
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.uploadingText}>Uploading & Verifying...</Text>
          <Text style={styles.uploadingSubtext}>This may take a moment</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        mode="video"
        facing="back"
      >
        {/* Watermark Overlay */}
        <View style={styles.watermarkContainer}>
          <View style={styles.watermark}>
            <Text style={styles.watermarkStar}>⭐</Text>
            <Text style={styles.watermarkUsername}>@{username}</Text>
            <Text style={styles.watermarkLogo}>Rendr</Text>
          </View>
        </View>

        {/* Recording Indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>RECORDING</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {isRecording ? (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopRecording}
            >
              <View style={styles.stopButtonInner} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
            >
              <View style={styles.recordButtonInner} />
            </TouchableOpacity>
          )}
        </View>

        {/* Instructions */}
        {!isRecording && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>
              📹 Tap the button to start recording
            </Text>
            <Text style={styles.instructionsSubtext}>
              Watermark will be embedded in your video
            </Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  permissionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  camera: {
    flex: 1,
  },
  watermarkContainer: {
    position: 'absolute',
    left: 20,
    top: 60,
    bottom: 60,
    justifyContent: 'center',
  },
  watermark: {
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  watermarkStar: {
    fontSize: 40,
    marginBottom: 10,
  },
  watermarkUsername: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    transform: [{ rotate: '90deg' }],
    width: 100,
    textAlign: 'center',
  },
  watermarkLogo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ef4444',
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  stopButtonInner: {
    width: 40,
    height: 40,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  instructions: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  instructionsSubtext: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  uploadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
  },
  uploadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
