import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Share2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { Post } from '../../hooks/useCommunityPosts';

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const { isAuthenticated, user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const { error } = await supabase
        .from('post_likes')
        .upsert([
          {
            post_id: post.id,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      setIsLiked(!isLiked);
      onUpdate();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: post.id,
            user_id: user.id,
            content: newComment.trim()
          }
        ]);

      if (error) throw error;

      setNewComment('');
      onUpdate();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {post.title}
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{post.profile.display_name || post.profile.email}</span>
              <span className="mx-2">•</span>
              <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
              {post.breed && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-blue-600 dark:text-blue-400">{post.breed}</span>
                </>
              )}
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {post.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span>{post.likes}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{post.comments.length}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {post.category}
          </span>
        </div>
      </div>

      {showComments && (
        <div className="border-t dark:border-gray-700 p-6">
          {isAuthenticated && (
            <form onSubmit={handleComment} className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Comment
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.profile.display_name || comment.profile.email}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(comment.created_at))} ago
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;