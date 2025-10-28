import FormScreen from "@/src/legacy/screen/FormScreen";
import { useLocalSearchParams } from "expo-router";

type QueryParams = {
  id: string;
  distortions?: string | string[];
  slide?: string;
};

export default function ThoughtEdit() {
  const p = useLocalSearchParams<QueryParams>();
  const initDistortions: readonly string[] =
    typeof p.distortions === "string"
      ? p.distortions === ""
        ? []
        : [p.distortions]
      : p.distortions ?? [];
  return (
    <FormScreen
      thoughtID={p.id}
      initDistortions={initDistortions}
      initSlide={p.slide}
    />
  );
}
