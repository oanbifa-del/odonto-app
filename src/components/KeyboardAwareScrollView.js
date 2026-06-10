import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';

const KeyboardAwareContext = createContext(() => {});

export function useKeyboardAwareFocus() {
  return useContext(KeyboardAwareContext);
}

export default function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  ...scrollViewProps
}) {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollToFocusedInput = useCallback(() => {
    const focusedInput = TextInput.State.currentlyFocusedInput?.();

    if (!focusedInput || !contentRef.current || !scrollRef.current) {
      return;
    }

    focusedInput.measureLayout(
      contentRef.current,
      (_x, y, _width, height) => {
        const extraOffset = Platform.OS === 'ios' ? 96 : 140;
        const targetY = Math.max(0, y + height - extraOffset);
        scrollRef.current?.scrollTo({ y: targetY, animated: true });
      },
      () => {}
    );
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates?.height || 0);
      setTimeout(scrollToFocusedInput, Platform.OS === 'ios' ? 120 : 80);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [scrollToFocusedInput]);

  return (
    <KeyboardAwareContext.Provider value={scrollToFocusedInput}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          {...scrollViewProps}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: styles.keyboardPadding.paddingBottom + keyboardHeight }
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          showsVerticalScrollIndicator={false}
        >
          <View ref={contentRef} style={[styles.content, contentContainerStyle]}>
            {children}
          </View>
        </ScrollView>
      </View>
    </KeyboardAwareContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1
  },
  content: {
    flexGrow: 1
  },
  keyboardPadding: {
    paddingBottom: 96
  }
});
