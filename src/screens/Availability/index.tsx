import React, { useState, useCallback, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, View, Text, TextInput, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@routes/stack.routes';
import theme from '@theme/index';
import { api } from '@config/api';
import * as S from './styles';

type Nav = StackNavigationProp<RootStackParamList, 'Availability'>;

interface Availability {
  id: string;
  type: 'WEEKLY' | 'SPECIFIC';
  dayOfWeek: number | null;
  specificDate: string | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  dayShortName: string;
  availabilities: Availability[];
}

const AvailabilityScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [sourceDay, setSourceDay] = useState<number | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const { height: windowHeight } = useWindowDimensions();
  const editSheetRef = useRef<BottomSheet>(null);
  const editSnapPoints = useMemo(() => [Math.floor(windowHeight * 0.5)], [windowHeight]);

  const daysOfWeek: DaySchedule[] = useMemo(() => [
    { dayOfWeek: 1, dayName: 'Segunda-feira', dayShortName: 'Seg.' },
    { dayOfWeek: 2, dayName: 'Terça-feira', dayShortName: 'Ter.' },
    { dayOfWeek: 3, dayName: 'Quarta-feira', dayShortName: 'Qua.' },
    { dayOfWeek: 4, dayName: 'Quinta-feira', dayShortName: 'Qui.' },
    { dayOfWeek: 5, dayName: 'Sexta-feira', dayShortName: 'Sex.' },
    { dayOfWeek: 6, dayName: 'Sábado', dayShortName: 'Sáb.' },
    { dayOfWeek: 0, dayName: 'Domingo', dayShortName: 'Dom.' },
  ], []);

  const loadAvailabilities = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/professionals/me/availability');
      setAvailabilities(res.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar disponibilidades:', error);
      if (error?.response?.status === 401) {
        Alert.alert('Erro', 'Sua sessão expirou. Por favor, faça login novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAvailabilities();
    }, [loadAvailabilities])
  );

  const getDayAvailabilities = (dayOfWeek: number): Availability[] => {
    return availabilities.filter(
      av => av.type === 'WEEKLY' && av.dayOfWeek === dayOfWeek && av.isActive
    );
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleAddTimeSlot = async (dayOfWeek: number) => {
    try {
      setIsSaving(true);
      // Criar um novo horário padrão (9:00 AM - 5:00 PM)
      await api.post('/professionals/me/availability', {
        type: 'WEEKLY',
        dayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      });
      await loadAvailabilities();
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message || 'Erro ao adicionar horário');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTimeSlot = async (availabilityId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este horário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await api.delete(`/professionals/me/availability/${availabilityId}`);
              await loadAvailabilities();
            } catch (error: any) {
              Alert.alert('Erro', error?.response?.data?.message || 'Erro ao excluir horário');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleEditTimeSlot = (availability: Availability) => {
    setEditingAvailability(availability);
    setEditStartTime(availability.startTime);
    setEditEndTime(availability.endTime);
    editSheetRef.current?.expand();
  };

  const handleSaveEdit = async () => {
    if (!editingAvailability) return;

    // Validar formato de hora (HH:mm)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(editStartTime) || !timeRegex.test(editEndTime)) {
      Alert.alert('Erro', 'Formato de hora inválido. Use HH:mm (ex: 09:00)');
      return;
    }

    // Validar que hora de início é antes da hora de fim
    const [startHour, startMin] = editStartTime.split(':').map(Number);
    const [endHour, endMin] = editEndTime.split(':').map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;

    if (startTotal >= endTotal) {
      Alert.alert('Erro', 'A hora de início deve ser anterior à hora de fim');
      return;
    }

    try {
      setIsSaving(true);
      await api.put(`/professionals/me/availability/${editingAvailability.id}`, {
        type: editingAvailability.type,
        dayOfWeek: editingAvailability.dayOfWeek,
        specificDate: editingAvailability.specificDate,
        startTime: editStartTime,
        endTime: editEndTime,
        isActive: editingAvailability.isActive,
      });
      await loadAvailabilities();
      editSheetRef.current?.close();
      setEditingAvailability(null);
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message || 'Erro ao atualizar horário');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyHours = (dayOfWeek: number) => {
    setSourceDay(dayOfWeek);
    setSelectedDays([]);
    setShowCopyModal(true);
  };

  const handleCopyApply = async () => {
    if (sourceDay === null || selectedDays.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um dia para copiar os horários');
      return;
    }

    try {
      setIsSaving(true);
      const sourceAvailabilities = getDayAvailabilities(sourceDay);

      // Para cada dia selecionado, primeiro deletar horários existentes e depois criar novos
      for (const targetDay of selectedDays) {
        // Deletar horários existentes do dia de destino
        const existingAvailabilities = getDayAvailabilities(targetDay);
        for (const existing of existingAvailabilities) {
          await api.delete(`/professionals/me/availability/${existing.id}`);
        }

        // Criar novos horários baseados no dia de origem
        for (const sourceAv of sourceAvailabilities) {
          await api.post('/professionals/me/availability', {
            type: 'WEEKLY',
            dayOfWeek: targetDay,
            startTime: sourceAv.startTime,
            endTime: sourceAv.endTime,
            isActive: true,
          });
        }
      }

      await loadAvailabilities();
      setShowCopyModal(false);
      setSourceDay(null);
      setSelectedDays([]);
      Alert.alert('Sucesso', 'Horários copiados com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message || 'Erro ao copiar horários');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDaySelection = (dayOfWeek: number) => {
    if (selectedDays.includes(dayOfWeek)) {
      setSelectedDays(selectedDays.filter(d => d !== dayOfWeek));
    } else {
      setSelectedDays([...selectedDays, dayOfWeek]);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
        <S.Container>
          <ActivityIndicator size="large" color={theme.COLORS.PRIMARY} />
        </S.Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
      <S.Container>
        <S.Header>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.COLORS.GREY_80} />
          </TouchableOpacity>
          <S.HeaderTitle>Disponibilidade</S.HeaderTitle>
          <View style={{ width: 24 }} />
        </S.Header>

        <ScrollView showsVerticalScrollIndicator={false}>
          {daysOfWeek.map((day) => {
            const dayAvailabilities = getDayAvailabilities(day.dayOfWeek);
            const isUnavailable = dayAvailabilities.length === 0;

            return (
              <S.DayCard key={day.dayOfWeek}>
                <S.DayHeader>
                  <S.DayName>{day.dayShortName}</S.DayName>
                  <S.DayActions>
                    <TouchableOpacity
                      onPress={() => handleAddTimeSlot(day.dayOfWeek)}
                      disabled={isSaving}
                      style={{ marginRight: 8 }}
                    >
                      <Ionicons name="add-circle-outline" size={24} color={theme.COLORS.PRIMARY} />
                    </TouchableOpacity>
                    {!isUnavailable && (
                      <TouchableOpacity
                        onPress={() => handleCopyHours(day.dayOfWeek)}
                        disabled={isSaving}
                      >
                        <Ionicons name="copy-outline" size={24} color={theme.COLORS.SECONDARY} />
                      </TouchableOpacity>
                    )}
                  </S.DayActions>
                </S.DayHeader>

                {isUnavailable ? (
                  <S.UnavailableText>Indisponível</S.UnavailableText>
                ) : (
                  dayAvailabilities.map((av) => (
                    <S.TimeSlot key={av.id}>
                      <TouchableOpacity
                        onPress={() => handleEditTimeSlot(av)}
                        style={{ flex: 1 }}
                        disabled={isSaving}
                      >
                        <S.TimeRange>
                          <S.TimeText>{formatTime(av.startTime)}</S.TimeText>
                          <S.TimeSeparator> - </S.TimeSeparator>
                          <S.TimeText>{formatTime(av.endTime)}</S.TimeText>
                        </S.TimeRange>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteTimeSlot(av.id)}
                        disabled={isSaving}
                        style={{ marginLeft: 12 }}
                      >
                        <Ionicons name="trash-outline" size={20} color={theme.COLORS.ERROR} />
                      </TouchableOpacity>
                    </S.TimeSlot>
                  ))
                )}
              </S.DayCard>
            );
          })}
        </ScrollView>

        {/* Modal de copiar horários */}
        <Modal
          visible={showCopyModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowCopyModal(false);
            setSourceDay(null);
            setSelectedDays([]);
          }}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <S.ModalContainer>
              <S.ModalHeader>
                <S.ModalTitle>Copiar horários para...</S.ModalTitle>
                <TouchableOpacity
                  onPress={() => {
                    setShowCopyModal(false);
                    setSourceDay(null);
                    setSelectedDays([]);
                  }}
                >
                  <Ionicons name="close" size={24} color={theme.COLORS.GREY_80} />
                </TouchableOpacity>
              </S.ModalHeader>

              <ScrollView>
                {daysOfWeek.map((day) => {
                  if (day.dayOfWeek === sourceDay) return null;
                  const isSelected = selectedDays.includes(day.dayOfWeek);

                  return (
                    <TouchableOpacity
                      key={day.dayOfWeek}
                      onPress={() => toggleDaySelection(day.dayOfWeek)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.COLORS.GREY_10,
                      }}
                    >
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'checkbox-outline'}
                        size={24}
                        color={isSelected ? theme.COLORS.PRIMARY : theme.COLORS.GREY_40}
                      />
                      <Text style={{ marginLeft: 12, fontSize: 16, color: theme.COLORS.GREY_80 }}>
                        {day.dayName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <S.ModalFooter>
                <TouchableOpacity
                  onPress={handleCopyApply}
                  disabled={isSaving || selectedDays.length === 0}
                  style={{
                    backgroundColor: selectedDays.length === 0 ? theme.COLORS.GREY_20 : theme.COLORS.PRIMARY,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={theme.COLORS.WHITE} />
                  ) : (
                    <Text style={{ color: theme.COLORS.WHITE, fontSize: 16, fontWeight: '600' }}>
                      Aplicar
                    </Text>
                  )}
                </TouchableOpacity>
              </S.ModalFooter>
            </S.ModalContainer>
          </SafeAreaView>
        </Modal>

        {/* Bottom Sheet para editar horário */}
        <BottomSheet
          ref={editSheetRef}
          index={-1}
          snapPoints={editSnapPoints}
          enablePanDownToClose
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
          )}
          onClose={() => {
            setEditingAvailability(null);
            setEditStartTime('');
            setEditEndTime('');
          }}
        >
          <BottomSheetScrollView>
            <S.EditSheetHeader>
              <S.EditSheetTitle>Editar Horário</S.EditSheetTitle>
              <TouchableOpacity onPress={() => editSheetRef.current?.close()}>
                <Ionicons name="close" size={24} color={theme.COLORS.GREY_80} />
              </TouchableOpacity>
            </S.EditSheetHeader>

            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.COLORS.GREY_60, marginBottom: 8 }}>
                Hora de Início (HH:mm)
              </Text>
              <S.TimeInput
                value={editStartTime}
                onChangeText={setEditStartTime}
                placeholder="09:00"
                keyboardType="numeric"
                maxLength={5}
              />

              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.COLORS.GREY_60, marginTop: 16, marginBottom: 8 }}>
                Hora de Fim (HH:mm)
              </Text>
              <S.TimeInput
                value={editEndTime}
                onChangeText={setEditEndTime}
                placeholder="17:00"
                keyboardType="numeric"
                maxLength={5}
              />

              <Text style={{ fontSize: 12, color: theme.COLORS.GREY_60, marginTop: 8 }}>
                Formato: HH:mm (ex: 09:00, 14:30)
              </Text>

              <TouchableOpacity
                onPress={handleSaveEdit}
                disabled={isSaving}
                style={{
                  backgroundColor: theme.COLORS.PRIMARY,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 24,
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={theme.COLORS.WHITE} />
                ) : (
                  <Text style={{ color: theme.COLORS.WHITE, fontSize: 16, fontWeight: '600' }}>
                    Salvar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </S.Container>
    </SafeAreaView>
  );
};

export default AvailabilityScreen;

