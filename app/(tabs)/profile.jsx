import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Text,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import { getUserPosts, signOut } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import VideoCard from "../../components/VideoCard";
import { useGlobalContext } from "../../context/GlobalProvider";
import { icons } from "../../constants";
import InfoBox from "../../components/InfoBox";
import { router } from "expo-router";
import Popover, { PopoverPlacement } from "react-native-popover-view";
import Toast from "react-native-toast-message";

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() => getUserPosts(user.$id));
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLoggedIn(false);

      Toast.show({
        type: "success",
        text1: "Logout!",
        text2: "Logout Successfully!",
      });

      setTimeout(() => {
        router.replace("/sign-in");
      }, 1000);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } 
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator.username}
            creatorId={item.creator.$id}
            avatar={item.creator.avatar}
            docId={item.$id}
            onRefresh={onRefresh}
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <Popover
              onCloseComplete={() => this.close}
              animationConfig={{
                duration: 70,
                useNativeDriver: false,
              }}
              offset={-40}
              popoverStyle={{ borderRadius: 10, backgroundColor: "#1E1E2D" }}
              placement={PopoverPlacement.BOTTOM}
              from={
                <TouchableOpacity className="justify-end self-end">
                  <Image
                    source={icons.logout}
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              }
            >
              <TouchableOpacity
                className="px-6 py-2 flex-row gap-2 justify-start items-center"
                onPress={logout}
              >
                <Image
                  source={icons.logout}
                  className="w-5 h-5"
                  resizeMode="contain"
                />

                <Text className="text-white font-pregular text-lg">Logout</Text>
              </TouchableOpacity>
            </Popover>

            <View className="h-16 w-16 border border-secondary rounded-lg justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                resizeMode="cover"
                className="w-[90%] h-[90%] rounded-lg"
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5">
              <InfoBox
                title={posts.length || 0}
                subtitle="Posts"
                titleStyles="text-xl"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="You don't have any videos uploaded"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Profile;
