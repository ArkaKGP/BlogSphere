const blog = require('../models/blogmodel');
const User = require('../models/usermodel');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const mlClient = require('../services/mlClient');

/**
 * Cosine similarity helper function
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// get all blogs (only public ones)
const getBlogs = async (req, res) => {
  try {
    const blogs = await blog.find({ choice: 'public' }).sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Getting my blogs
const getmyBlogs = async (req, res) => {
  const { username } = req.params;

  try {
    const blogs = await blog.find({ username }).sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get single blog
const getoneBlog = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such blog. Id is not valid' });
  }

  try {
    const oneblog = await blog.findById(id);

    if (!oneblog) {
      return res.status(404).json({ error: 'No such blog' });
    }
    res.status(200).json(oneblog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// create blog with ML enrichment (embeddings, tags, summary)
const createBlog = async (req, res) => {
  const { title, image, choice, description, author, username } = req.body;

  try {
    // Enrich content using ML Service
    const mlData = await mlClient.enrichBlog(title, description);

    const Blog = await blog.create({
      title,
      image,
      choice,
      description,
      author,
      username,
      embedding: mlData.embedding || [],
      tags: mlData.tags || [],
      summary: mlData.summary || '',
      status: 'published'
    });

    res.status(200).json(Blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete blog
const deleteBlog = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such blog. Id is not valid' });
  }

  try {
    const deletedBlog = await blog.findOneAndDelete({ _id: id });

    if (!deletedBlog) {
      return res.status(404).json({ error: 'No such blog' });
    }

    res.status(200).json(deletedBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update blog
const updateBlog = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such blog. Id is not valid' });
  }

  try {
    const updatedBlog = await blog.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: 'No such blog' });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// add comment
const addBlogComment = async (req, res) => {
  const { id } = req.params;
  const { newComment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such blog. Id is not valid' });
  }

  if (!newComment || typeof newComment !== 'string' || newComment.trim() === '') {
    return res.status(400).json({ error: 'Invalid comment provided' });
  }

  try {
    const updatedBlog = await blog.findOneAndUpdate(
      { _id: id },
      { $push: { comments: newComment.trim() } },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: 'No such blog' });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update blog likes & update user likedBlogs (enforces 1 like per user with toggle)
const updateBlogLikes = async (req, res) => {
  const { id } = req.params;
  const { username, userId } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such blog. Id is not valid' });
  }

  const userIdentifier = username || userId;
  if (!userIdentifier) {
    return res.status(400).json({ error: 'User identification (username or userId) is required to like a blog' });
  }

  try {
    const targetBlog = await blog.findById(id);
    if (!targetBlog) {
      return res.status(404).json({ error: 'No such blog' });
    }

    const likedByList = Array.isArray(targetBlog.likedBy) ? targetBlog.likedBy : [];
    const alreadyLiked = likedByList.includes(userIdentifier);
    let updatedBlog;

    if (alreadyLiked) {
      // User already liked -> Toggle UNLIKE
      updatedBlog = await blog.findOneAndUpdate(
        { _id: id },
        {
          $pull: { likedBy: userIdentifier },
          $inc: { likes: -1 }
        },
        { new: true }
      );

      const userQuery = userId ? { _id: userId } : { username };
      await User.findOneAndUpdate(userQuery, { $pull: { likedBlogs: id } });

    } else {
      // User has not liked yet -> Toggle LIKE
      updatedBlog = await blog.findOneAndUpdate(
        { _id: id },
        {
          $addToSet: { likedBy: userIdentifier },
          $inc: { likes: 1 }
        },
        { new: true }
      );

      const userQuery = userId ? { _id: userId } : { username };
      await User.findOneAndUpdate(userQuery, { $addToSet: { likedBlogs: id } });

      // Notify blog author if different from liker
      if (updatedBlog.username && updatedBlog.username !== userIdentifier) {
        try {
          await Notification.create({
            recipientUsername: updatedBlog.username,
            senderUsername: userIdentifier,
            blogId: updatedBlog._id,
            blogTitle: updatedBlog.title,
            message: `${userIdentifier} liked your blog "${updatedBlog.title}"`
          });
        } catch (notifErr) {
          console.error('Notification creation error:', notifErr.message);
        }
      }
    }

    // Safety check to prevent negative like counts
    if (updatedBlog.likes < 0) {
      updatedBlog = await blog.findOneAndUpdate({ _id: id }, { $set: { likes: 0 } }, { new: true });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Semantic Vector Search (MongoDB Atlas Vector Search with fallback)
const semanticSearchBlogs = async (req, res) => {
  const { query } = req.query;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Search query string is required.' });
  }

  try {
    // 1. Obtain query embedding from ML service
    const queryVector = await mlClient.getEmbedding(query.trim());

    if (!queryVector || queryVector.length === 0) {
      // If embedding service fails, fallback to regex search
      const fallbackBlogs = await blog.find({
        choice: 'public',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      }).sort({ createdAt: -1 });
      return res.status(200).json(fallbackBlogs);
    }

    // 2. Try Atlas Vector Search aggregation pipeline
    try {
      const vectorResults = await blog.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryVector,
            numCandidates: 50,
            limit: 20
          }
        },
        {
          $match: { choice: 'public' }
        }
      ]);

      if (vectorResults && vectorResults.length > 0) {
        return res.status(200).json(vectorResults);
      }
    } catch (vectorError) {
      console.log('ℹ️ Atlas $vectorSearch pipeline not supported or index missing. Falling back to in-memory cosine vector ranking.');
    }

    // 3. Fallback: In-memory cosine similarity ranking
    const publicBlogs = await blog.find({ choice: 'public' });

    const rankedBlogs = publicBlogs
      .map(b => {
        const blogObj = b.toObject();
        let simScore = 0;
        if (blogObj.embedding && blogObj.embedding.length > 0) {
          simScore = cosineSimilarity(queryVector, blogObj.embedding);
        } else {
          // Keyword overlap fallback boost
          const text = `${blogObj.title} ${blogObj.description}`.toLowerCase();
          if (text.includes(query.toLowerCase())) simScore = 0.5;
        }
        return { ...blogObj, similarityScore: simScore };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore);

    res.status(200).json(rankedBlogs);
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Personalized Recommendations Feed for logged-in user
const getRecommendationsForUser = async (req, res) => {
  const { username } = req.query;

  try {
    let user = null;
    if (username) {
      user = await User.findOne({ username }).populate('likedBlogs');
    }

    // 1. Check if user has liked blogs with embeddings
    if (user && user.likedBlogs && user.likedBlogs.length > 0) {
      const likedEmbeddings = user.likedBlogs
        .map(b => b.embedding)
        .filter(emb => Array.isArray(emb) && emb.length > 0);

      if (likedEmbeddings.length > 0) {
        const dim = likedEmbeddings[0].length;
        const userPrefVector = new Array(dim).fill(0);

        for (const emb of likedEmbeddings) {
          for (let i = 0; i < dim; i++) {
            userPrefVector[i] += emb[i];
          }
        }
        for (let i = 0; i < dim; i++) {
          userPrefVector[i] /= likedEmbeddings.length;
        }

        // Get public blogs not created or liked by user
        const likedBlogIds = user.likedBlogs.map(b => b._id.toString());
        const candidateBlogs = await blog.find({ choice: 'public' });

        const recommended = candidateBlogs
          .filter(b => !likedBlogIds.includes(b._id.toString()))
          .map(b => {
            const blogObj = b.toObject();
            let score = 0;
            if (blogObj.embedding && blogObj.embedding.length === dim) {
              score = cosineSimilarity(userPrefVector, blogObj.embedding);
            }
            return { ...blogObj, matchScore: score };
          })
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 10);

        if (recommended.length > 0) {
          return res.status(200).json(recommended);
        }
      }
    }

    // 2. Fallback: Return top liked public blogs
    const topBlogs = await blog.find({ choice: 'public' }).sort({ likes: -1, createdAt: -1 }).limit(10);
    res.status(200).json(topBlogs);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// add collaborator by username
const addCollaborator = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such blog. Id is not valid' });
  }

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'Valid collaborator username is required' });
  }

  const targetUsername = username.trim();

  try {
    // 1. Fetch the target blog
    const targetBlog = await blog.findById(id);
    if (!targetBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // 2. Verify requesting user is original author if auth context is provided
    if (req.user && req.user.id) {
      const authUser = await User.findById(req.user.id);
      if (authUser) {
        const isAuthor = authUser.username === targetBlog.username || authUser.username === targetBlog.author;
        if (!isAuthor) {
          return res.status(403).json({ error: 'Only the original author can add collaborators' });
        }
      }
    }

    // 3. Verify target username exists in User database
    const collaboratorUser = await User.findOne({ username: targetUsername });
    if (!collaboratorUser) {
      return res.status(404).json({ error: `User '${targetUsername}' does not exist` });
    }

    // 4. Check if target username is author or already in collaborators array
    if (targetUsername === targetBlog.username || targetUsername === targetBlog.author) {
      return res.status(400).json({ error: `'${targetUsername}' is the author of this blog` });
    }

    if (targetBlog.collaborators && targetBlog.collaborators.includes(targetUsername)) {
      return res.status(400).json({ error: `'${targetUsername}' is already a collaborator` });
    }

    // 5. Add collaborator and save
    const updatedBlog = await blog.findByIdAndUpdate(
      id,
      { $addToSet: { collaborators: targetUsername } },
      { new: true, runValidators: true }
    );

    // 6. Create collaboration invitation notification for recipient
    try {
      const senderName = targetBlog.author || targetBlog.username || 'Author';
      const notification = await Notification.create({
        recipientUsername: targetUsername,
        senderUsername: senderName,
        blogId: targetBlog._id,
        blogTitle: targetBlog.title,
        message: `${senderName} invited you to collaborate on '${targetBlog.title}'`
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('newNotification', notification);
      }
    } catch (notifErr) {
      console.error('Error creating notification:', notifErr.message);
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBlogs,
  getoneBlog,
  createBlog,
  deleteBlog,
  updateBlog,
  updateBlogLikes,
  addBlogComment,
  getmyBlogs,
  semanticSearchBlogs,
  getRecommendationsForUser,
  addCollaborator
};