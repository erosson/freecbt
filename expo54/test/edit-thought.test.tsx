/**
 * @jest-environment jsdom
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { SharedValue } from "react-native-reanimated";
import EditThought from "../src/app/v2/(public)/thoughts/[idOrKey]/edit";
import { I18nProvider } from "../src/hooks/use-i18n";
import { ModelProvider } from "../src/hooks/use-model";
import { LightTheme } from "../src/hooks/use-style";
import { Thought } from "../src/model";

const mockId = "00000000-0000-4000-8000-000000000001";
const mockNavigate = jest.fn();
let mockProgress: SharedValue<number>;

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ idOrKey: mockId, slide: "distortions" }),
  useRouter: () => ({ navigate: mockNavigate }),
}));

jest.mock("react-native-safe-area-context", () =>
  jest.requireActual("react-native-safe-area-context/jest/mock").default
);

jest.mock("expo-image", () => ({
  Image: jest.requireActual("react-native").Image,
}));

jest.mock("react-native-reanimated", () => ({
  useSharedValue: (value: number) =>
    React.useRef({
      value,
      get() {
        return this.value;
      },
    }).current,
}));

// Keep the real editor and its React state, but render the carousel's slides
// without native animation. Explicitly simulate arriving at the requested slide.
jest.mock("react-native-reanimated-carousel", () => ({
  __esModule: true,
  default: function Carousel({
    data,
    renderItem: Item,
    defaultIndex,
    onProgressChange,
  }: {
    data: string[];
    renderItem: React.ComponentType<{ item: string; index: number }>;
    defaultIndex: number;
    onProgressChange: SharedValue<number>;
  }) {
    React.useEffect(() => {
      onProgressChange.value = defaultIndex;
      mockProgress = onProgressChange;
    }, [defaultIndex, onProgressChange]);
    return data.map((item, index) => (
      <Item key={item} item={item} index={index} />
    ));
  },
  Pagination: { Basic: () => null },
}));

const fixture: Thought.Json = {
  uuid: mockId,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  automaticThought: "A synthetic thought for the editor test",
  cognitiveDistortions: ["all-or-nothing", "catastrophizing"],
  challenge: "A synthetic challenge",
  alternativeThought: "A synthetic alternative",
  v: Thought.VERSION,
};
const key = `${Thought.KEY_PREFIX}${mockId}`;
const allOrNothing = /All or Nothing Thinking/;
const catastrophizing = /Catastrophizing/;

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(key, JSON.stringify(fixture));
  mockNavigate.mockClear();
});

async function openEditor() {
  const result = render(
    <I18nProvider locale="en">
      <ModelProvider>
        <EditThought />
      </ModelProvider>
    </I18nProvider>
  );
  await screen.findByText(allOrNothing);
  return result;
}

async function saveAndExpect(slugs: string[]) {
  const writes = jest.mocked(AsyncStorage.setItem).mock.calls.length;
  fireEvent.press(screen.getByText("Save & Finish"));
  await waitFor(async () => {
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(writes + 1);
    // Read the raw JSON, so duplicate slugs cannot be hidden by the parser.
    const saved = JSON.parse((await AsyncStorage.getItem(key))!);
    expect(saved).toEqual({ ...fixture, cognitiveDistortions: slugs });
  });
}

test("shows the selections loaded from a saved thought", async () => {
  await openEditor();
  expect(screen.getByText(allOrNothing)).toHaveStyle({
    color: LightTheme.selectedText,
  });
  expect(screen.getByText(catastrophizing)).toHaveStyle({
    color: LightTheme.selectedText,
  });
  expect(screen.getByText(/Mind Reading/)).toHaveStyle({
    color: LightTheme.text,
  });
  fireEvent(screen.getByRole("switch"), "valueChange", true);
  expect(
    screen.getByText("I bombed the interview, I must be unhirable.")
  ).toHaveStyle({
    color: LightTheme.selectedText,
    backgroundColor: LightTheme.selectedBackgroundCard,
  });
});

test.each([
  { name: "unique", slugs: ["all-or-nothing", "catastrophizing"] },
  {
    name: "duplicated",
    slugs: ["all-or-nothing", "all-or-nothing", "catastrophizing"],
  },
])("deselects and reselects $name stored choices without changing other choices", async ({ slugs }) => {
  await AsyncStorage.setItem(
    key,
    JSON.stringify({ ...fixture, cognitiveDistortions: slugs })
  );
  let editor = await openEditor();
  fireEvent.press(screen.getByText(allOrNothing));
  await saveAndExpect(["catastrophizing"]);
  editor.unmount();

  editor = await openEditor();
  expect(screen.getByText(allOrNothing)).toHaveStyle({ color: LightTheme.text });
  fireEvent.press(screen.getByText(allOrNothing));
  await saveAndExpect(["catastrophizing", "all-or-nothing"]);
  editor.unmount();

  await openEditor();
  expect(screen.getByText(allOrNothing)).toHaveStyle({
    color: LightTheme.selectedText,
  });
  // A further save must preserve exactly one of each selected slug.
  await saveAndExpect(["catastrophizing", "all-or-nothing"]);
});

test.each([0, 1.5])(
  "ignores distortion taps while carousel progress is %s",
  async (progress) => {
    await openEditor();
    mockProgress.value = progress;
    expect(mockProgress.get()).toBe(progress);
    fireEvent.press(screen.getByText(allOrNothing));
    await saveAndExpect(fixture.cognitiveDistortions);
  }
);
