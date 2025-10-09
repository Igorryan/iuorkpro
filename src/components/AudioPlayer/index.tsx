import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import styled from 'styled-components/native';

interface AudioPlayerProps {
  audioUri: string;
  duration?: number;
  isMine: boolean;
}

const AudioContainer = styled(View)<{ isMine: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  border-radius: 20px;
  background-color: ${({ theme, isMine }) => (isMine ? theme.COLORS.SECONDARY : theme.COLORS.GREY)};
  min-width: 220px;
  max-width: 75%;
`;

const PlayButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.2);
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const WaveformContainer = styled(View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 24px;
  margin-right: 12px;
`;

const WaveformBar = styled(View)<{ height: number; active: boolean }>`
  width: 3px;
  height: ${({ height }) => height}px;
  border-radius: 2px;
  background-color: ${({ active }) => (active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)')};
`;

const Duration = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.WHITE};
`;

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUri, duration = 0, isMine }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(duration * 1000);

  const waveformHeights = [8, 16, 12, 20, 16, 24, 20, 16, 12, 16, 20, 12, 8];

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playPauseAudio = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis || playbackDuration);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const currentTime = isPlaying ? position / 1000 : duration;
  const progress = playbackDuration > 0 ? position / playbackDuration : 0;

  return (
    <AudioContainer isMine={isMine}>
      <PlayButton onPress={playPauseAudio}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color="#FFF" />
      </PlayButton>
      
      <WaveformContainer>
        {waveformHeights.map((height, index) => (
          <WaveformBar
            key={index}
            height={height}
            active={index / waveformHeights.length < progress}
          />
        ))}
      </WaveformContainer>
      
      <Duration>{formatTime(currentTime)}</Duration>
    </AudioContainer>
  );
};

