import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Automatic thought:</Text>
      <TextInput style={textInputStyle()} multiline={true} />
      <Text>Distortions:</Text>
      <Text>TODO</Text>
      <Text>Challenge:</Text>
      <TextInput style={textInputStyle()} multiline={true} />
      <Text>Alternative:</Text>
      <TextInput style={textInputStyle()} multiline={true} />
      <TouchableOpacity>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

export const textInputStyle = () => ({
  height: 156,
  backgroundColor: "white",
  padding: 12,
  paddingTop: 14,
  borderRadius: 8,
  fontSize: 16,
  // borderColor: theme.lightGray,
  borderColor: "lightgray",
  borderWidth: 1,
  // color: theme.darkText,
  color: "black",
});
