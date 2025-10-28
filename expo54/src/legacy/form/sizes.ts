import { Dimensions } from "react-native";

const viewport = Dimensions.get("window");

function wp(percentage: number) {
  const value = (percentage * viewport.width) / 100;
  return Math.round(value);
}

const slideWidth = wp(75);
const itemHorizontalMargin = wp(2);

export const sliderWidth = viewport.width;
export const sliderHeight = viewport.height;
export const itemWidth = slideWidth + itemHorizontalMargin * 2;
