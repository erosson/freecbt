import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

function WelcomePage() {
  return <Text>Welcome!</Text>;
}

test("simplest possible render", () => {
  const { getByText } = render(<WelcomePage />);

  getByText("Welcome!");
});
