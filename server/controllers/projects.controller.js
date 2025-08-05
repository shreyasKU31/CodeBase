const { validationResult } = require("express-validator");
const { uploadImage } = require("../utils/cloudinary");
const { createClerkSupabaseClient } = require("../config/supabase");

const getAllPublicProjects = async (req, res) => {
  try {
    // Use default Supabase client for public data
    const supabase = createClerkSupabaseClient();
    
    // Fixed: Using proper Supabase syntax for joins and counts
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        author:users (
          id,
          username,
          display_name,
          profile_picture
        )
      `
      )
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get like and comment counts for each project
    const projectsWithCounts = await Promise.all(
      (data || []).map(async (project) => {
        // Get like count
        const { count: likeCount } = await supabase
          .from("project_likes")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id);

        // Get comment count
        const { count: commentCount } = await supabase
          .from("project_comments")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id);

        return {
          ...project,
          likeCount: likeCount || 0,
          commentCount: commentCount || 0,
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    console.error("Error fetching discover feed:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

const getUserProject = async (req, res) => {
  try {
    // Use Clerk-integrated Supabase client for user-specific data
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        author:users (
          id,
          username,
          display_name,
          profile_picture
        )
      `
      )
      .eq("author", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Failed to fetch user projects" });
  }
};

const getSingleProjectByID = async (req, res) => {
  try {
    // Use default Supabase client for public data
    const supabase = createClerkSupabaseClient();
    
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        author:users (
          id,
          username,
          display_name,
          profile_picture
        )
      `
      )
      .eq("id", req.params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "Project not found" });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching single project:", error);
    res.status(500).json({ message: "Failed to fetch project" });
  }
};

const createNewProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('Creating project for user:', req.user.id);
    
    // Use Clerk-integrated Supabase client for authenticated operations
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    // Check if user exists in users table, if not create a basic profile
    console.log('Checking user with ID:', req.user.id);
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", req.user.id)
      .single();

    if (userError && userError.code === "PGRST116") {
      // User doesn't exist, create a basic profile
      console.log('User not found in database, creating basic profile...');
      const userData = {
        id: req.user.id,
        username: `user_${Date.now()}`,
        display_name: req.user.email || 'User',
        is_profile_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Only add email if the column exists (will be handled by database)
      if (req.user.email) {
        userData.email = req.user.email;
      }
      
      const { error: createUserError } = await supabase
        .from("users")
        .insert(userData);

      if (createUserError) {
        console.error('Error creating user profile:', createUserError);
        return res.status(500).json({ message: 'Failed to create user profile' });
      }
    } else if (userError) {
      console.error('Error checking user:', userError);
      return res.status(500).json({ message: 'Failed to verify user' });
    }
    
    let thumbnailUrl = "";
    let imageUrls = [];

    // Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
          "base64"
        )}`;
        return uploadImage(dataUri, "devhance/images");
      });

      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.url);
      thumbnailUrl = imageUrls[0]; // Use the first uploaded image as the thumbnail
    }

    const projectData = {
      title: req.body.title,
      description: req.body.description,
      story: req.body.story,
      thumbnail: thumbnailUrl,
      images: imageUrls,
      videos: req.body.videos ? JSON.parse(req.body.videos) : [],
      tech_stack: req.body.techStack ? JSON.parse(req.body.techStack) : [],
      github_url: req.body.githubUrl || null,
      live_url: req.body.liveUrl || null,
      figma_url: req.body.figmaUrl || null,
      youtube_url: req.body.youtubeUrl || null,
      other_links: req.body.otherLinks ? JSON.parse(req.body.otherLinks) : {},
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      author: req.user.id,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting project with data:', JSON.stringify(projectData, null, 2));
    
    const { data, error } = await supabase
      .from("projects")
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Project created successfully:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating project:", error);
    res
      .status(500)
      .json({ message: "Failed to create project", details: error.message });
  }
};

const like = async (req, res) => {
  try {
    // Use Clerk-integrated Supabase client for authenticated operations
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    const projectId = req.params.id;
    const userId = req.user.id;

    // Check if user already liked this project
    const { data: existingLike, error: checkError } = await supabase
      .from("project_likes")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingLike) {
      return res.status(400).json({ message: "Project already liked" });
    }

    // Add the like
    const { data: likeData, error: likeError } = await supabase
      .from("project_likes")
      .insert({
        project_id: projectId,
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (likeError) throw likeError;

    res.json({ message: "Project liked successfully", like: likeData });
  } catch (error) {
    console.error("Error liking project:", error);
    res.status(500).json({ message: "Failed to like project" });
  }
};

const unlike = async (req, res) => {
  try {
    // Use Clerk-integrated Supabase client for authenticated operations
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    const projectId = req.params.id;
    const userId = req.user.id;

    const { error } = await supabase
      .from("project_likes")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ message: "Project unliked successfully" });
  } catch (error) {
    console.error("Error unliking project:", error);
    res.status(500).json({ message: "Failed to unlike project" });
  }
};

const deleteProject = async (req, res) => {
  try {
    // Use Clerk-integrated Supabase client for authenticated operations
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    const projectId = req.params.id;
    const userId = req.user.id;

    // First check if the project exists and belongs to the user
    const { data: project, error: fetchError } = await supabase
      .from("projects")
      .select("id, author")
      .eq("id", projectId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ message: "Project not found" });
      }
      throw fetchError;
    }

    if (project.author !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own projects" });
    }

    // Delete the project (cascade will handle likes and comments)
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (deleteError) throw deleteError;

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
};

// Comments functionality
const getProjectComments = async (req, res) => {
  try {
    // Use default Supabase client for public data
    const supabase = createClerkSupabaseClient();
    
    const projectId = req.params.id;

    const { data, error } = await supabase
      .from("project_comments")
      .select(
        `
        *,
        users (
          id,
          username,
          display_name,
          profile_picture
        )
      `
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error("Error fetching project comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

const addProjectComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Use Clerk-integrated Supabase client for authenticated operations
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    const projectId = req.params.id;
    const userId = req.user.id;
    const { text } = req.body;

    // Check if project exists
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();

    if (projectError) {
      if (projectError.code === "PGRST116") {
        return res.status(404).json({ message: "Project not found" });
      }
      throw projectError;
    }

    // Add the comment
    const { data: comment, error: commentError } = await supabase
      .from("project_comments")
      .insert({
        project_id: projectId,
        user_id: userId,
        text: text,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(
        `
        *,
        users (
          id,
          username,
          display_name,
          profile_picture
        )
      `
      )
      .single();

    if (commentError) throw commentError;

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

const updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('Updating project for user:', req.user.id);
    
    // Use Clerk-integrated Supabase client for authenticated operations
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    const projectId = req.params.id;
    const userId = req.user.id;

    // Check if project exists and belongs to user
    const { data: existingProject, error: projectError } = await supabase
      .from("projects")
      .select("id, author")
      .eq("id", projectId)
      .single();

    if (projectError) {
      if (projectError.code === "PGRST116") {
        return res.status(404).json({ message: "Project not found" });
      }
      throw projectError;
    }

    if (existingProject.author !== userId) {
      return res.status(403).json({ message: "You can only update your own projects" });
    }

    // Parse JSON fields safely
    const videos = req.body.videos ? JSON.parse(req.body.videos) : [];
    const tech_stack = req.body.tech_stack ? JSON.parse(req.body.tech_stack) : [];
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    const other_links = req.body.other_links ? JSON.parse(req.body.other_links) : [];

    // Prepare project data
    const projectData = {
      title: req.body.title,
      description: req.body.description,
      story: req.body.story,
      tech_stack: tech_stack,
      tags: tags,
      videos: videos,
      other_links: other_links,
      github_url: req.body.github_url || null,
      live_url: req.body.live_url || null,
      figma_url: req.body.figma_url || null,
      youtube_url: req.body.youtube_url || null,
      updated_at: new Date().toISOString()
    };

    // Handle image uploads if files are present
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const result = await uploadImage(dataUri, "devhance/projects");
        imageUrls.push(result.url);
      }
      projectData.images = imageUrls;
    }

    // Handle thumbnail if provided
    if (req.body.thumbnail) {
      projectData.thumbnail = req.body.thumbnail;
    }

    console.log('Updating project with data:', projectData);

    // Update the project
    const { data, error } = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error);
      throw error;
    }

    console.log('Project updated successfully:', data);
    res.json(data);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
};

const updateProjectComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Use Clerk-integrated Supabase client for authenticated operations
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    const projectId = req.params.id;
    const commentId = req.params.commentId;
    const userId = req.user.id;
    const { text } = req.body;

    // Check if comment exists and belongs to user
    const { data: existingComment, error: commentError } = await supabase
      .from("project_comments")
      .select("id, user_id, project_id")
      .eq("id", commentId)
      .single();

    if (commentError) {
      if (commentError.code === "PGRST116") {
        return res.status(404).json({ message: "Comment not found" });
      }
      throw commentError;
    }

    if (existingComment.user_id !== userId) {
      return res.status(403).json({ message: "You can only update your own comments" });
    }

    if (existingComment.project_id !== projectId) {
      return res.status(400).json({ message: "Comment does not belong to this project" });
    }

    // Update the comment
    const { data: comment, error: updateError } = await supabase
      .from("project_comments")
      .update({
        text: text,
        updated_at: new Date().toISOString()
      })
      .eq("id", commentId)
      .select(
        `
        *,
        users (
          id,
          username,
          display_name,
          profile_picture
        )
      `
      )
      .single();

    if (updateError) throw updateError;

    res.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
};

const deleteProjectComment = async (req, res) => {
  try {
    // Use Clerk-integrated Supabase client for authenticated operations
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    const projectId = req.params.id;
    const commentId = req.params.commentId;
    const userId = req.user.id;

    // Check if comment exists and belongs to user
    const { data: existingComment, error: commentError } = await supabase
      .from("project_comments")
      .select("id, user_id, project_id")
      .eq("id", commentId)
      .single();

    if (commentError) {
      if (commentError.code === "PGRST116") {
        return res.status(404).json({ message: "Comment not found" });
      }
      throw commentError;
    }

    if (existingComment.user_id !== userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    if (existingComment.project_id !== projectId) {
      return res.status(400).json({ message: "Comment does not belong to this project" });
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from("project_comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) throw deleteError;

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

module.exports = {
  getAllPublicProjects,
  getUserProject,
  getSingleProjectByID,
  createNewProject,
  updateProject,
  like,
  unlike,
  deleteProject,
  getProjectComments,
  addProjectComment,
  updateProjectComment,
  deleteProjectComment,
};
