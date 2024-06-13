import { StatusBar } from "expo-status-bar";
import { Text, View, ScrollView, Image, ActivityIndicator } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import CustomButton from "../components/CustomButton";
import * as NavigationBar from "expo-navigation-bar";
import { useGlobalContext } from "../context/GlobalProvider";

export default function App() {
  NavigationBar.setBackgroundColorAsync("#161622");
  NavigationBar.setButtonStyleAsync("dark");

  const { isLoading, isLoggedIn } = useGlobalContext();

  if (!isLoading && isLoggedIn) return <Redirect href="/home" />;

  return (
    <SafeAreaView className="bg-primary h-full">
      {isLoading ? (
        <View className="w-full justify-center items-center h-full px-4">
          <Image
            source={images.logo}
            className="w-[130px] h-[100px]"
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ height: "100%" }}>
          <View className="w-full justify-center items-center h-full px-4">
            <Image
              source={images.logo}
              className="w-[130px] h-[84px]"
              resizeMode="contain"
            />
            <Image
              source={images.cards}
              className="max-w-[380px] w-full h-[300px]"
              resizeMode="contain"
            />

            <View className="relative mt-5">
              <Text className="text-3xl text-white font-bold text-center">
                Discover Endless Possibilites with{" "}
                <Text className="text-secondary-200">Aorify</Text>
              </Text>

              <Image
                source={images.path}
                className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
                resizeMode="contain"
              />
            </View>

            <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">
              Where creativity meets innovation: embark on a journey of a
              limitless exploration with Aorify
            </Text>

            <CustomButton
              title="Continue with Email"
              handlePress={() => router.push("/sign-in")}
              containerStyles="w-full mt-7 mb-10"
            />

            <StatusBar backgroundColor="#161622" style="light" />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
