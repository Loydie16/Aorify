import { View, Text, FlatList, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import { getSavedPosts, getCurrentUser } from "../../lib/appwrite";
import VideoCard from "../../components/VideoCard";

const Bookmark = () => {
  const [savedPosts, setSavedPosts] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedPosts = async () => {
    try {
      const currentUser = await getCurrentUser();
      const posts = await getSavedPosts(currentUser.$id);
      setSavedPosts(posts);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedPosts();
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={savedPosts}
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
          <View className="my-6 px-4">
            <Text className="text-2xl text-white font-psemibold">
              Saved Videos
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Bookmark;
