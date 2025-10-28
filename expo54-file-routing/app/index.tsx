import { Text, View } from "react-native";

export default function Index() {
  // return <Redirect href="/legacy" />;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      {/* <Link style={style.link} href="/legacy"> */}
      {/* Legacy app */}
      {/* </Link> */}
    </View>
  );
}

// const style = StyleSheet.create({
// link: {
// color: "blue",
// textDecorationLine: "underline",
// },
// });
