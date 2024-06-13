import { View, Text, ScrollView, Image, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import { getCurrentUser, signIn } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import Toast from "react-native-toast-message";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser, setIsLoggedIn } = useGlobalContext();

  const submit = async () => {
    if (!form.email || !form.password) {
      Toast.show({
        type: "error",
        text1: "All Fields are Required!",
        text2: "Please fill in all the fields.",
      });
    }

    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password);

      const result = await getCurrentUser();
      setUser(result);
      setIsLoggedIn(true);

      Toast.show({
        type: "success",
        text1: "Authenticated!",
        text2: "Successfully signed in!",
        position: "bottom",
      });

      router.replace("/home");
    } catch (error) {
      if (
        error.message ===
        "AppwriteException: Rate limit for the current endpoint has been exceeded. Please try again after some time."
      ) {
        Toast.show({
          type: "error",
          text1: "Rate limit exceeded for this endpoint.",
          text2: "Please try again after some time.",
        });
      } else if (
        error.message ===
        "AppwriteException: Invalid `email` param: Value must be a valid email address"
      ) {
        Toast.show({
          type: "error",
          text1: "Invalid Email Address.",
          text2: "Please input a valid email address.",
        });
      } else if (
        error.message ===
        "AppwriteException: Invalid credentials. Please check the email and password."
      ) {
        Toast.show({
          type: "error",
          text1: "Invalid Credentials.",
          text2: "Please check your email and password and try again.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error occurred.",
          text2: "Please try again!",
        });
        Alert.alert("Error", error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <Image
            source={images.logo}
            className="w-[115px] h-[35px]"
            resizeMode="contain"
          />

          <Text className="text-white text-2xl text-semibold font-psemibold mt-10">
            Login to Aorify
          </Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
