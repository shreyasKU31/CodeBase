const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { uploadImage, uploadMultipleImages } = require('../utils/cloudinary');
const supabase = require('../config/supabase');

const router = express.Router();

// Get all public projects (discover feed)
router.get('/discover', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users!projects_author_fkey (
          id,
          username,
          display_name,
          profile_picture
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get user's own projects
router.get('/my-projects', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('author', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users!projects_author_fkey (
          id,
          username,
          display_name,
          profile_picture,
          headline,
          location
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', auth, uploadMultiple, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required and must be less than 2000 characters'),
  body('story').trim().isLength({ min: 1, max: 5000 }).withMessage('Story is required and must be less than 5000 characters'),
  body('techStack').isArray().withMessage('Tech stack must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let thumbnailUrl = '';
    let imageUrls = [];

    // Upload thumbnail
    if (req.files && req.files.length > 0) {
      const thumbnailFile = req.files[0];
      const thumbnailBuffer = thumbnailFile.buffer.toString('base64');
      const thumbnailDataUri = `data:${thumbnailFile.mimetype};base64,${thumbnailBuffer}`;
      
      const thumbnailResult = await uploadImage(thumbnailDataUri, 'devhance/thumbnails');
      thumbnailUrl = thumbnailResult.url;

      // Upload additional images
      if (req.files.length > 1) {
        const additionalFiles = req.files.slice(1);
        const uploadPromises = additionalFiles.map(file => {
          const buffer = file.buffer.toString('base64');
          const dataUri = `data:${file.mimetype};base64,${buffer}`;
          return uploadImage(dataUri, 'devhance/images');
        });
        
        const results = await Promise.all(uploadPromises);
        imageUrls = results.map(result => result.url);
      }
    }

    const projectData = {
      title: req.body.title,
      description: req.body.description,
      story: req.body.story,
      thumbnail: thumbnailUrl,
      images: imageUrls,
      tech_stack: req.body.techStack || [],
      github_url: req.body.githubUrl || '',
      live_url: req.body.liveUrl || '',
      figma_url: req.body.figmaUrl || '',
      youtube_url: req.body.youtubeUrl || '',
      other_links: req.body.otherLinks || [],
      tags: req.body.tags || [],
      author: req.user.id,
      is_public: true
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating project:', error);
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating project:', error);
    
    // Provide more specific error messages
    if (error.code === 'PGRST200') {
      res.status(500).json({ 
        message: 'Database schema not set up. Please run the database schema first.',
        details: error.message 
      });
    } else if (error.code === '23505') {
      res.status(400).json({ 
        message: 'Project with this title already exists',
        details: error.message 
      });
    } else if (error.code === '23503') {
      res.status(400).json({ 
        message: 'Invalid user reference. Please ensure you are logged in.',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to create project',
        details: error.message 
      });
    }
  }
});

// Update project
router.put('/:id', auth, uploadMultiple, async (req, res) => {
  try {
    // Check if user owns the project
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('author')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (existingProject.author !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    let updateData = {
      title: req.body.title,
      description: req.body.description,
      story: req.body.story,
      tech_stack: req.body.techStack || [],
      github_url: req.body.githubUrl || '',
      live_url: req.body.liveUrl || '',
      figma_url: req.body.figmaUrl || '',
      youtube_url: req.body.youtubeUrl || '',
      other_links: req.body.otherLinks || [],
      tags: req.body.tags || []
    };

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        const buffer = file.buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${buffer}`;
        return uploadImage(dataUri, 'devhance/images');
      });
      
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.url);
      
      updateData.images = imageUrls;
      if (req.files.length > 0) {
        updateData.thumbnail = imageUrls[0];
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user owns the project
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('author')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (existingProject.author !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// Like/Unlike project
router.post('/:id/like', auth, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Check if user already liked the project
    const { data: existingLike, error: fetchError } = await supabase
      .from('project_likes')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('project_likes')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
      res.json({ message: 'Project unliked' });
    } else {
      // Like
      const { error } = await supabase
        .from('project_likes')
        .insert({
          project_id: projectId,
          user_id: userId
        });

      if (error) throw error;
      res.json({ message: 'Project liked' });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
});

// Add comment
router.post('/:id/comments', auth, [
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data, error } = await supabase
      .from('project_comments')
      .insert({
        project_id: req.params.id,
        user_id: req.user.id,
        text: req.body.text
      })
      .select(`
        *,
        users!project_comments_user_id_fkey (
          id,
          username,
          display_name,
          profile_picture
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Get project comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('project_comments')
      .select(`
        *,
        users!project_comments_user_id_fkey (
          id,
          username,
          display_name,
          profile_picture
        )
      `)
      .eq('project_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

module.exports = router; 