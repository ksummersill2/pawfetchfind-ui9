import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  breed: string;
  category: string;
  likes: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  profile: Profile;
  comments: Array<{
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    profile: Profile;
  }>;
}

interface CreatePostData {
  title: string;
  content: string;
  category: string;
  breed?: string;
  user_id: string;
}

export const useCommunityPosts = (category: string = 'all') => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = supabase
        .from('community_posts')
        .select(`
          *,
          profile:profiles!user_id(*),
          comments:post_comments(
            id,
            content,
            user_id,
            created_at,
            profile:profiles!user_id(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (data: CreatePostData): Promise<boolean> => {
    try {
      const { error: createError } = await supabase
        .from('community_posts')
        .insert([data]);

      if (createError) throw createError;

      await fetchPosts();
      return true;
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
      return false;
    }
  };

  const deletePost = async (postId: string, userId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      await fetchPosts();
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
      return false;
    }
  };

  const toggleLike = async (postId: string, userId: string): Promise<boolean> => {
    try {
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: userId }]);

        if (insertError) throw insertError;
      }

      await fetchPosts();
      return true;
    } catch (err) {
      console.error('Error toggling like:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category]);

  return {
    posts,
    loading,
    error,
    createPost,
    deletePost,
    toggleLike,
    refreshPosts: fetchPosts
  };
};