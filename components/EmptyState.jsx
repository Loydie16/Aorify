import { View, Text, Image, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { images } from "../constants";
import CustomButton from "./CustomButton";
import { router } from "expo-router";

const EmptyState = ({ title, subtitle }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show ActivityIndicator for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Cleanup the timer on component unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          <Image
            source={images.empty}
            style={{ width: 270, height: 215 }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontFamily: "Poppins-Medium",
              fontSize: 14,
              color: "#bbb",
              marginTop: 8,
            }}
          >
            {subtitle}
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "Poppins-SemiBold",
              fontSize: 20,
              color: "#fff",
              marginTop: 8,
            }}
          >
            {title}
          </Text>
          <CustomButton
            title="Create video"
            handlePress={() => router.push("/create")}
            containerStyles={{ width: "100%", marginTop: 20 }}
          />
        </>
      )}
    </View>
  );
};

export default EmptyState;
