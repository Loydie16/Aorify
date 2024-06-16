import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { icons } from "../constants";
import { Video, ResizeMode } from "expo-av";
import Popover, { PopoverPlacement } from "react-native-popover-view";
import {
  deleteVideo,
  savePost,
  getCurrentUser,
  unsavePost,
} from "../lib/appwrite";
import Toast from "react-native-toast-message";
import { useGlobalContext } from "../context/GlobalProvider";

const VideoCard = ({
  title,
  creator,
  creatorId,
  avatar,
  thumbnail,
  video,
  docId,
  onRefresh,
}) => {
  const { user, savedPosts, setSavedPosts } = useGlobalContext();
  const [play, setPlay] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false); // New state for popover visibility

  const isSaved = savedPosts.includes(docId);

  const handleSavePost = async () => {
    try {
      setSaveLoading(true);
      const currentUser = await getCurrentUser();
      await savePost(docId, currentUser.$id);
      setSavedPosts([...savedPosts, docId]);
      Toast.show({
        type: "success",
        text1: "Saved!",
        text2: "Post Saved Successfully!",
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setSaveLoading(false);
      setPopoverVisible(false); // Close popover after saving
    }
  };

  const handleUnsavePost = async () => {
    try {
      setSaveLoading(true);
      const currentUser = await getCurrentUser();
      await unsavePost(docId, currentUser.$id);
      setSavedPosts(savedPosts.filter((id) => id !== docId));
      Toast.show({
        type: "info",
        text1: "Unsaved!",
        text2: "Post Unsaved Successfully!",
      });
      onRefresh();
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setSaveLoading(false);
      setPopoverVisible(false); // Close popover after unsaving
    }
  };

  const deleteVid = async () => {
    try {
      setDelLoading(true);
      await deleteVideo(docId);
      Toast.show({
        type: "success",
        text1: "Deleted!",
        text2: "Post Deleted Successfully!",
      });
      onRefresh();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setDelLoading(false);
      setPopoverVisible(false); // Close popover after deleting
    }
  };

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary-100 justify-center items-center p-0.5 ">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {creator}
            </Text>
          </View>
        </View>

        <View className="pt-2">
          <Popover
            isVisible={popoverVisible}
            onRequestClose={() => setPopoverVisible(false)}
            animationConfig={{
              duration: 70,
              useNativeDriver: false,
            }}
            offset={-25}
            popoverStyle={{ borderRadius: 10, backgroundColor: "#1E1E2D" }}
            placement={PopoverPlacement.BOTTOM}
            from={
              <TouchableOpacity onPress={() => setPopoverVisible(true)}>
                <Image
                  source={icons.menu}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            }
          >
            {isSaved ? (
              <TouchableOpacity
                className="px-6 py-2 flex-row gap-2 justify-start items-center"
                onPress={handleUnsavePost}
              >
                <Image
                  source={icons.bookmark}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                {saveLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-pregular text-lg">
                    Saved
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="px-6 py-2 flex-row gap-2 justify-start items-center"
                onPress={handleSavePost}
              >
                <Image
                  source={icons.bookmark}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                {saveLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-pregular text-lg">Save</Text>
                )}
              </TouchableOpacity>
            )}
            {user && user.$id === creatorId && (
              <TouchableOpacity
                className="px-6 py-2 flex-row gap-2 justify-start items-center"
                onPress={deleteVid}
              >
                <Image
                  source={icons.Delete}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                {delLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-pregular text-lg">
                    Delete
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </Popover>
        </View>
      </View>

      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />

          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
