import FormScreen from "@/src/legacy/screen/FormScreen";
import { useLocalSearchParams } from "expo-router";

type QueryParams = {
  "from-intro"?: string;
  distortions?: string | string[];
  slide?: string;
};

export default function ThoughtCreate() {
  const p = useLocalSearchParams<QueryParams>();
  const fromIntro = !!p["from-intro"];
  const initDistortions: readonly string[] =
    typeof p.distortions === "string"
      ? p.distortions === ""
        ? []
        : [p.distortions]
      : p.distortions ?? [];
  return (
    <FormScreen
      fromIntro={fromIntro}
      initDistortions={initDistortions}
      initSlide={p.slide}
    />
  );
}
