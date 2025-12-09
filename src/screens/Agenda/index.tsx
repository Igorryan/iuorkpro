import React, { useState, useMemo, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addMonths, endOfMonth, format, getDay, startOfMonth, subMonths } from 'date-fns';
import styled, { css } from 'styled-components/native';
import theme from '@theme/index';
import { api } from '@config/api';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@hooks/auth';

interface Availability {
  id: string;
  type: 'WEEKLY' | 'SPECIFIC';
  dayOfWeek: number | null;
  specificDate: string | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const Agenda: React.FC = () => {
  const { user } = useAuth();
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isUpdatingOnline, setIsUpdatingOnline] = useState(false);

  const loadAvailabilities = useCallback(async () => {
    try {
      setIsLoading(true);
      const [availRes, profileRes] = await Promise.all([
        api.get('/professionals/me/availability'),
        api.get('/professionals/me'),
      ]);
      setAvailabilities(availRes.data);
      setIsOnline(profileRes.data.isOnline || false);
    } catch (error: any) {
      console.error('Erro ao carregar disponibilidades:', error);
      if (error?.response?.status === 401) {
        Alert.alert('Erro', 'Sua sessão expirou. Por favor, faça login novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleOnline = useCallback(async (value: boolean) => {
    try {
      setIsUpdatingOnline(true);
      setIsOnline(value);
      await api.put('/professionals/me/online', { isOnline: value });
    } catch (error: any) {
      console.error('Erro ao atualizar status online:', error);
      setIsOnline(!value); // Reverter em caso de erro
      Alert.alert('Erro', error?.response?.data?.message || 'Erro ao atualizar status online');
    } finally {
      setIsUpdatingOnline(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAvailabilities();
    }, [loadAvailabilities])
  );

  // Calcular dias do mês
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const firstWeekdayIndex = getDay(monthStart);
  const totalDays = Number(format(monthEnd, 'd'));

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstWeekdayIndex; i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= totalDays; day += 1) {
    const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    days.push(d);
  }

  const weekDayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Verificar se uma data tem disponibilidade
  const hasAvailability = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');
    
    return availabilities.some(av => {
      if (!av.isActive) return false;
      
      if (av.type === 'WEEKLY' && av.dayOfWeek === dayOfWeek) {
        return true;
      }
      
      if (av.type === 'SPECIFIC' && av.specificDate) {
        const avDateStr = format(new Date(av.specificDate), 'yyyy-MM-dd');
        return avDateStr === dateStr;
      }
      
      return false;
    });
  };

  // Obter disponibilidades de uma data
  const getDateAvailabilities = (date: Date): Availability[] => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');
    
    return availabilities.filter(av => {
      if (!av.isActive) return false;
      
      if (av.type === 'WEEKLY' && av.dayOfWeek === dayOfWeek) {
        return true;
      }
      
      if (av.type === 'SPECIFIC' && av.specificDate) {
        const avDateStr = format(new Date(av.specificDate), 'yyyy-MM-dd');
        return avDateStr === dateStr;
      }
      
      return false;
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
        <Container>
          <ActivityIndicator size="large" color={theme.COLORS.PRIMARY} />
        </Container>
      </SafeAreaView>
    );
  }

  const selectedAvailabilities = selectedDate ? getDateAvailabilities(selectedDate) : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
      <Container>
        <Header>
          <Title>Agenda</Title>
          <OnlineContainer>
            <OnlineLabel>Online</OnlineLabel>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              disabled={isUpdatingOnline}
              trackColor={{ false: theme.COLORS.GREY_20, true: theme.COLORS.SUCCESS + '80' }}
              thumbColor={isOnline ? theme.COLORS.SUCCESS : theme.COLORS.GREY_40}
              ios_backgroundColor={theme.COLORS.GREY_20}
            />
          </OnlineContainer>
        </Header>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Calendário */}
          <CalendarCard>
            <MonthHeader>
              <NavButton onPress={() => setVisibleMonth((m) => subMonths(m, 1))}>
                <Ionicons name="chevron-back" size={20} color={theme.COLORS.GREY_80} />
              </NavButton>
              <MonthTitle>{format(visibleMonth, 'MMMM yyyy')}</MonthTitle>
              <NavButton onPress={() => setVisibleMonth((m) => addMonths(m, 1))}>
                <Ionicons name="chevron-forward" size={20} color={theme.COLORS.GREY_80} />
              </NavButton>
            </MonthHeader>

            <WeekDaysRow>
              {weekDayLabels.map((label, index) => (
                <WeekDay key={`weekday-${index}`}>{label}</WeekDay>
              ))}
            </WeekDaysRow>

            <DaysGrid>
              {days.map((d, idx) => {
                if (!d)
                  return <DayPlaceholder key={`empty-${idx}`} />;
                
                const hasAvail = hasAvailability(d);
                const isSelected = selectedDate ? format(selectedDate, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd') : false;
                const isToday = format(new Date(), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd');
                
                return (
                  <Day 
                    key={d.toISOString()} 
                    onPress={() => setSelectedDate(d)}
                    selected={isSelected}
                    hasAvailability={hasAvail}
                    isToday={isToday}
                  >
                    <DayText selected={isSelected} hasAvailability={hasAvail} isToday={isToday}>
                      {format(d, 'd')}
                    </DayText>
                    {hasAvail && <Dot />}
                  </Day>
                );
              })}
              {/* Preencher espaços vazios na última linha para manter o layout */}
              {Array.from({ length: (7 - (days.length % 7)) % 7 }).map((_, idx) => (
                <DayPlaceholder key={`fill-${idx}`} />
              ))}
            </DaysGrid>
          </CalendarCard>

          {/* Detalhes da data selecionada */}
          {selectedDate && (
            <DetailsCard>
              <DetailsHeader>
                <DetailsTitle>Disponibilidade - {format(selectedDate, 'dd/MM/yyyy')}</DetailsTitle>
              </DetailsHeader>
              {selectedAvailabilities.length === 0 ? (
                <EmptyText>Nenhuma disponibilidade para este dia</EmptyText>
              ) : (
                selectedAvailabilities.map((av) => (
                  <AvailabilityItem key={av.id}>
                    <AvailabilityTime>
                      {av.startTime} - {av.endTime}
                    </AvailabilityTime>
                    <AvailabilityType>
                      {av.type === 'WEEKLY' ? 'Recorrente' : 'Específica'}
                    </AvailabilityType>
                  </AvailabilityItem>
                ))
              )}
            </DetailsCard>
          )}
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default Agenda;

const Container = styled.View`
  flex: 1;
  background-color: ${theme.COLORS.BACKGROUND};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: ${theme.COLORS.WHITE};
  border-bottom-width: 1px;
  border-bottom-color: ${theme.COLORS.GREY_10};
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.COLORS.GREY_80};
  flex: 1;
`;

const OnlineContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const OnlineLabel = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.COLORS.GREY_60};
`;

const CalendarCard = styled.View`
  background-color: ${theme.COLORS.WHITE};
  margin: 20px;
  padding: 20px;
  border-radius: 16px;
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 3;
`;

const MonthHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const NavButton = styled.TouchableOpacity`
  padding: 8px;
`;

const MonthTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.COLORS.GREY_80};
  text-transform: capitalize;
`;

const WeekDaysRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const WeekDay = styled.Text`
  width: ${100 / 7}%;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.COLORS.GREY_60};
`;

const DaysGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const DayPlaceholder = styled.View`
  width: ${100 / 7}%;
  aspect-ratio: 1;
  margin-bottom: 8px;
`;

const Day = styled.TouchableOpacity<{ selected: boolean; hasAvailability: boolean; isToday: boolean }>`
  width: ${100 / 7}%;
  aspect-ratio: 1;
  margin-bottom: 8px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  position: relative;
  ${(p) =>
    p.selected &&
    css`
      background-color: ${theme.COLORS.PRIMARY};
    `}
  ${(p) =>
    !p.selected &&
    p.isToday &&
    css`
      border-width: 2px;
      border-color: ${theme.COLORS.PRIMARY};
    `}
`;

const DayText = styled.Text<{ selected: boolean; hasAvailability: boolean; isToday: boolean }>`
  font-size: 16px;
  color: ${(p) => (p.selected ? theme.COLORS.WHITE : p.isToday ? theme.COLORS.PRIMARY : theme.COLORS.GREY_80)};
  font-weight: ${(p) => (p.selected || p.isToday ? '700' : '400')};
`;

const Dot = styled.View`
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background-color: ${theme.COLORS.SUCCESS};
`;

const DetailsCard = styled.View`
  background-color: ${theme.COLORS.WHITE};
  margin: 0 20px 20px;
  padding: 20px;
  border-radius: 16px;
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 3;
`;

const DetailsHeader = styled.View`
  margin-bottom: 16px;
`;

const DetailsTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.COLORS.GREY_80};
`;

const AvailabilityItem = styled.View`
  padding: 12px;
  background-color: ${theme.COLORS.GREY_10};
  border-radius: 8px;
  margin-bottom: 8px;
`;

const AvailabilityTime = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.COLORS.GREY_80};
  margin-bottom: 4px;
`;

const AvailabilityType = styled.Text`
  font-size: 12px;
  color: ${theme.COLORS.GREY_60};
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: ${theme.COLORS.GREY_60};
  text-align: center;
  padding: 20px;
`;

