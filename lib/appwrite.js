import {
  Avatars,
  Account,
  Databases,
  Client,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.jlt.aorify",
  projectId: "666c7111002e61e81231",
  databaseId: "666c71950004336eed73",
  userCollectionId: "666c724b002609013cb4",
  videoCollectionId: "666c71b40029d30e1bcc",
  storageId: "666c72cd0038c996fde2",
  savedPostsCollectionId: "666d512d001aa14ea296",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
  savedPostsCollectionId,
} = config;

// Init your React Native SDK
const client = new Client();

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      { accountId: newAccount.$id, email, username, avatar: avatarUrl }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt", Query.limit(7)),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search("title", query),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("creator", userId),
      Query.orderDesc("$createdAt"),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const uploadFile = async (file, type) => {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteVideo = async (docId) => {
  try {
    // Retrieve the document to get file IDs
    const post = await databases.getDocument(
      databaseId,
      videoCollectionId,
      docId
    );

    // Extract file IDs from the document
    const { thumbnail, video } = post;

    // Delete files from storage
    if (thumbnail) {
      await storage.deleteFile(storageId, extractFileIdFromUrl(thumbnail));
    }
    if (video) {
      await storage.deleteFile(storageId, extractFileIdFromUrl(video));
    }

    // Delete the document from the database
    const deletePost = await databases.deleteDocument(
      databaseId,
      videoCollectionId,
      docId
    );

    return deletePost;
  } catch (error) {
    console.error("Error deleting video and associated files:", error);
    throw new Error(error);
  }
};

// Helper function to extract file ID from file URL
const extractFileIdFromUrl = (url) => {
  // Assuming the URL format contains the file ID
  const regex = /files\/([^/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};


export const savePost = async (postId, userId) => {
  try {
    const savedPost = await databases.createDocument(
      databaseId,
      savedPostsCollectionId,
      ID.unique(),
      { postId, userId }
    );

    return savedPost;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// Function to get saved posts for a user
export const getSavedPosts = async (userId) => {
  try {
    const savedPosts = await databases.listDocuments(
      databaseId,
      savedPostsCollectionId,
      [Query.equal("userId", userId)]
    );

    if (!savedPosts) throw Error;

    const postIds = savedPosts.documents.map((doc) => doc.postId);

    // Fetch the details of each saved post
    const posts = await Promise.all(
      postIds.map(async (postId) => {
        const post = await databases.getDocument(databaseId, videoCollectionId, postId);
        return post;
      })
    );

    return posts;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// Function to unsave a post
export const unsavePost = async (postId, userId) => {
  try {
    const savedPosts = await databases.listDocuments(
      databaseId,
      savedPostsCollectionId,
      [Query.equal("postId", postId), Query.equal("userId", userId)]
    );

    if (!savedPosts.documents.length) throw new Error("Post not found");

    const savedPostId = savedPosts.documents[0].$id;

    const unsavedPost = await databases.deleteDocument(
      databaseId,
      savedPostsCollectionId,
      savedPostId
    );

    return unsavedPost;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};