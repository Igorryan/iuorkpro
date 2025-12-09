import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import theme from '@theme/index';
import * as S from './styles';

export interface BottomSheetModalRef {
  open: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

export interface BottomSheetModalProps {
  title: string;
  children: React.ReactNode;
  snapPoints?: number[];
  heightPercentage?: number; // Porcentagem da altura da tela (0-1)
  enablePanDownToClose?: boolean;
  enableOverDrag?: boolean;
  enableHandlePanningGesture?: boolean;
  enableDynamicSizing?: boolean;
  animateOnMount?: boolean;
  onClose?: () => void;
  onChange?: (index: number) => void;
  showCloseButton?: boolean;
  useScrollView?: boolean; // Se true, usa BottomSheetScrollView, senão usa BottomSheetView
  backdropOpacity?: number;
  backdropPressBehavior?: 'none' | 'close';
}

const BottomSheetModal = forwardRef<BottomSheetModalRef, BottomSheetModalProps>(
  (
    {
      title,
      children,
      snapPoints: customSnapPoints,
      heightPercentage = 0.7,
      enablePanDownToClose = true,
      enableOverDrag = false,
      enableHandlePanningGesture = true,
      enableDynamicSizing = false,
      animateOnMount = true,
      onClose,
      onChange,
      showCloseButton = true,
      useScrollView = true,
      backdropOpacity = 0.5,
      backdropPressBehavior = 'close',
    },
    ref
  ) => {
    const { height: windowHeight } = useWindowDimensions();
    const bottomSheetRef = React.useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => {
      if (customSnapPoints && customSnapPoints.length > 0) {
        return customSnapPoints;
      }
      return [Math.floor(windowHeight * heightPercentage)];
    }, [customSnapPoints, windowHeight, heightPercentage]);

    useImperativeHandle(ref, () => ({
      open: () => {
        bottomSheetRef.current?.snapToIndex(0);
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
      snapToIndex: (index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
      },
    }));

    const handleChange = (index: number) => {
      if (index === -1 && onClose) {
        onClose();
      }
      if (onChange) {
        onChange(index);
      }
    };

    const handleClose = () => {
      bottomSheetRef.current?.close();
      if (onClose) {
        onClose();
      }
    };

    const ContentWrapper = useScrollView ? BottomSheetScrollView : BottomSheetView;
    const contentProps = useScrollView
      ? { showsVerticalScrollIndicator: false, contentContainerStyle: { paddingBottom: 24 } }
      : {};

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        enableOverDrag={enableOverDrag}
        enableHandlePanningGesture={enableHandlePanningGesture}
        enableDynamicSizing={enableDynamicSizing}
        animateOnMount={animateOnMount}
        onChange={handleChange}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={backdropOpacity}
            pressBehavior={backdropPressBehavior}
          />
        )}
        backgroundStyle={{ backgroundColor: theme.COLORS.WHITE }}
        handleIndicatorStyle={{ backgroundColor: theme.COLORS.GREY_40 }}
      >
        <View>
          <S.Header>
            <S.Title>{title}</S.Title>
            {showCloseButton && (
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={theme.COLORS.GREY_80} />
              </TouchableOpacity>
            )}
          </S.Header>

          <ContentWrapper {...contentProps}>{children}</ContentWrapper>
        </View>
      </BottomSheet>
    );
  }
);

BottomSheetModal.displayName = 'BottomSheetModal';

export default BottomSheetModal;

