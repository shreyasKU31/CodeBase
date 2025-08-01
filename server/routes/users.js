const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { uploadImage } = require('../utils/cloudinary');
const supabase = require('../config/supabase');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Get public user profile by username
router.get('/:username', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, display_name, headline, location, profile_picture, bio, github_url, linkedin_url, website_url, created_at')
      .eq('username', req.params.username)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Create/Update user profile
router.post('/profile', auth, uploadSingle, [
  body('displayName').trim().isLength({ min: 1, max: 50 }).withMessage('Display name is required and must be less than 50 characters'),
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('headline').optional().trim().isLength({ max: 100 }).withMessage('Headline must be less than 100 characters'),
  body('location').optional().trim().isLength({ max: 50 }).withMessage('Location must be less than 50 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let profilePictureUrl = '';

    // Upload profile picture if provided
    if (req.file) {
      const buffer = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${buffer}`;
      
      const result = await uploadImage(dataUri, 'devhance/profiles');
      profilePictureUrl = result.url;
    }

    // Check if username is already taken by another user
    if (req.body.username) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', req.body.username)
        .neq('id', req.user.id)
        .single();

      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    const profileData = {
      id: req.user.id,
      username: req.body.username,
      display_name: req.body.displayName,
      headline: req.body.headline || '',
      location: req.body.location || '',
      bio: req.body.bio || '',
      github_url: req.body.githubUrl || '',
      linkedin_url: req.body.linkedinUrl || '',
      website_url: req.body.websiteUrl || '',
      is_profile_complete: true
    };

    if (profilePictureUrl) {
      profileData.profile_picture = profilePictureUrl;
    }

    // Check if user profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', req.user.id)
      .single();

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get user's projects
router.get('/:username/projects', async (req, res) => {
  try {
    // First get the user ID from username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', req.params.username)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's projects
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('author', user.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

module.exports = router; 