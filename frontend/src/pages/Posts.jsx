import { useState } from 'react';
import Navbar from '../components/Navbar';

/* Mock feed – no backend posts endpoint in Phases 1–9 */
const INITIAL_POSTS = [
  {
    id: 1,
    author: 'Meena Krishnan',
    avatar: 'MK',
    time: '2 hours ago',
    content:
      'Thrilled to share that I have joined Amazon as a Senior SDE! Grateful to my mentors at college and the AMS platform for keeping alumni connected. Excited for this next chapter 🚀',
    likes: 24,
    comments: 5,
    liked: false,
  },
  {
    id: 2,
    author: 'Ravi Shankar',
    avatar: 'RS',
    time: '1 day ago',
    content:
      'Our research paper "Federated Learning for Healthcare" got accepted at NeurIPS 2026! 🎉 Happy to mentor students interested in research. DM me.',
    likes: 48,
    comments: 12,
    liked: false,
  },
  {
    id: 3,
    author: 'Divya Nair',
    avatar: 'DN',
    time: '3 days ago',
    content:
      'Conducted a mock interview session for final year students last weekend. Their enthusiasm was infectious! Keep grinding, batch of 2026 💪',
    likes: 31,
    comments: 8,
    liked: false,
  },
];

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-emerald-500', 'bg-rose-500',
  'bg-amber-500',  'bg-cyan-500',    'bg-primary-500',
];

function getAvatarColor(str) {
  let hash = 0;
  for (const c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Posts() {
  const [posts,    setPosts]    = useState(INITIAL_POSTS);
  const [newPost,  setNewPost]  = useState('');
  const [posting,  setPosting]  = useState(false);

  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'You';
  const initials = userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  function handlePost(e) {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    /* Simulate async – would be api.post('/posts', { content }) */
    setTimeout(() => {
      const post = {
        id:       Date.now(),
        author:   userName,
        avatar:   initials,
        time:     'Just now',
        content:  newPost.trim(),
        likes:    0,
        comments: 0,
        liked:    false,
      };
      setPosts([post, ...posts]);
      setNewPost('');
      setPosting(false);
    }, 300);
  }

  function toggleLike(id) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }

  function deletePost(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Posts" subtitle="Share updates with the alumni community" />

      <div className="flex-1 p-6 space-y-5 max-w-2xl">

        {/* Compose Box */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${getAvatarColor(userName)}`}>
              {initials}
            </div>
            <form onSubmit={handlePost} className="flex-1 space-y-3">
              <textarea
                rows={3}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share an update, achievement, or opportunity with the community…"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newPost.trim() || posting}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold
                             rounded-lg transition-colors disabled:opacity-40"
                >
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5
                           hover:shadow-md transition-shadow">

                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                                     text-white text-xs font-bold ${getAvatarColor(post.author)}`}>
                      {post.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{post.author}</p>
                      <p className="text-xs text-slate-400">{post.time}</p>
                    </div>
                  </div>
                  {/* Show delete only for the current user's posts */}
                  {post.author === userName && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-xs text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-sm text-slate-700 leading-relaxed mb-4">{post.content}</p>

                {/* Divider */}
                <div className="border-t border-slate-100 pt-3 flex items-center gap-5">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors
                      ${post.liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}
                  >
                    <HeartIcon className={`w-4 h-4 ${post.liked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                    {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
                  </button>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CommentIcon className="w-4 h-4" />
                    {post.comments} {post.comments === 1 ? 'Comment' : 'Comments'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HeartIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
}
function CommentIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
}
function TrashIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
}
