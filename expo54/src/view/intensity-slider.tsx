import React, { useRef, useState } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface IntensitySliderProps {
  value: number; // 0 to 100
  onChange: (value: number) => void;
  textColor?: string;
  isDark?: boolean;
}

export function IntensitySlider({
  value,
  onChange,
  textColor = "#000",
  isDark = false,
}: IntensitySliderProps) {
  const [sliderWidth, setSliderWidth] = useState<number>(0);
  const sliderWidthRef = useRef<number>(0);
  sliderWidthRef.current = sliderWidth;

  const updateFromPosition = (pageX: number, locationX?: number) => {
    const width = sliderWidthRef.current;
    if (width <= 0) return;
    const x = locationX !== undefined ? locationX : 0;
    const clampedX = Math.max(0, Math.min(width, x));
    const nextVal = Math.round((clampedX / width) * 100);
    onChange(Math.max(0, Math.min(100, nextVal)));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        updateFromPosition(evt.nativeEvent.pageX, evt.nativeEvent.locationX);
      },
      onPanResponderMove: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const width = sliderWidthRef.current;
        if (width <= 0) return;
        const localX = evt.nativeEvent.locationX;
        updateFromPosition(evt.nativeEvent.pageX, localX);
      },
      onPanResponderRelease: (evt: GestureResponderEvent) => {
        updateFromPosition(evt.nativeEvent.pageX, evt.nativeEvent.locationX);
      },
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      setSliderWidth(w);
      sliderWidthRef.current = w;
    }
  };

  const trackBg = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";
  const fillBg = "#546de5";
  const clampedVal = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: textColor }]}>
          {clampedVal}%
        </Text>
      </View>

      <View
        style={[styles.trackContainer]}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <View style={[styles.track, { backgroundColor: trackBg }]}>
          <View
            style={[
              styles.fill,
              { width: `${clampedVal}%`, backgroundColor: fillBg },
            ]}
          />
        </View>
        <View
          style={[
            styles.thumb,
            {
              left: `${clampedVal}%`,
              backgroundColor: "#fff",
              borderColor: fillBg,
            },
          ]}
        />
      </View>

      <View style={styles.presetsRow}>
        {[0, 25, 50, 75, 100].map((preset) => (
          <TouchableOpacity
            key={preset}
            style={[
              styles.presetBtn,
              {
                backgroundColor:
                  clampedVal === preset
                    ? fillBg
                    : isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.04)",
              },
            ]}
            onPress={() => onChange(preset)}
          >
            <Text
              style={[
                styles.presetText,
                {
                  color: clampedVal === preset ? "#fff" : textColor,
                  opacity: clampedVal === preset ? 1 : 0.7,
                },
              ]}
            >
              {preset}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
  trackContainer: {
    height: 36,
    justifyContent: "center",
    position: "relative",
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  thumb: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    top: 7,
    marginLeft: -11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  presetsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  presetBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  presetText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
