import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Text,
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
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import CustomButton from "../../components/CustomButton";

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() => getUserPosts(user.$id));
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      setIsLoggedIn(false);

      Toast.show({
        type: "success",
        text1: "Logout!",
        text2: "Logout Successfully!",
      });

      router.replace("/sign-in");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setLoading(false);
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
            <TouchableOpacity
              className="justify-end self-end onPress={logout}"
              onPress={toggleModal}
            >
              <Image
                source={icons.logout}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>

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
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn={"fadeInUp"}
        animationInTiming={500}
      >
        <View className="flex justify-center items-center bg-slate-300 h-[25%] rounded-xl">
          <Text className="text-black font-psemibold text-xl text-center p-4">
            Are you sure you want to logout?
          </Text>
          <View className="flex flex-row w-full justify-evenly">
            <CustomButton
              containerStyles="px-10 text"
              textStyles="text-red-600"
              title="Yes"
              handlePress={logout}
              isLoading={loading}
            />
            <CustomButton
              containerStyles="px-10"
              textStyles="text-green-600"
              title="No"
              handlePress={toggleModal}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
