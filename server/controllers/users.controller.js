const { uploadImage } = require("../utils/cloudinary");
const { createClerkSupabaseClient } = require("../config/supabase");
const { validationResult } = require("express-validator");

const userDetails = async (req, res) => {
  try {
    // Use Clerk-integrated Supabase client
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res
          .status(404)
          .json({ message: "User profile not found. Please complete setup." });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

const syncUserData = async (req, res) => {
  try {
    console.log("Syncing user data for:", req.user.id);

    const { userData } = req.body;

    if (!userData) {
      return res.status(400).json({ message: "User data is required" });
    }

    // Use Clerk-integrated Supabase client
    const supabase = createClerkSupabaseClient(req.clerkToken);

    // Prepare user profile data
    const userProfile = {
      id: req.user.id,
      username:
        userData.username ||
        userData.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
        `user_${Date.now()}`,
      display_name:
        userData.firstName && userData.lastName
          ? `${userData.firstName} ${userData.lastName}`
          : userData.firstName ||
            userData.lastName ||
            userData.username ||
            "User",
      profile_picture: userData.imageUrl || null,
      is_profile_complete: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Only add email if it exists in userData
    if (userData.emailAddresses?.[0]?.emailAddress) {
      userProfile.email = userData.emailAddresses[0].emailAddress;
    }

    // Use upsert to create or update user
    const { data, error } = await supabase
      .from("users")
      .upsert(userProfile)
      .select()
      .single();

    if (error) {
      console.error("Error syncing user to database:", error);
      throw error;
    }

    console.log("Successfully synced user to database:", data);
    res.json(data);
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ message: "Failed to sync user data" });
  }
};

const getPublicUser = async (req, res) => {
  try {
    // Use default Supabase client for public data
    const { createClerkSupabaseClient } = require("../config/supabase");
    const supabase = createClerkSupabaseClient();
    
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, username, display_name, headline, location, profile_picture, bio, github_url, linkedin_url, website_url, created_at"
      )
      .eq("username", req.params.username)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "User not found" });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching public user profile:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Use Clerk-integrated Supabase client
    const supabase = createClerkSupabaseClient(req.clerkToken);
    
    // Check if the desired username is already taken by another user
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", req.body.username)
      .neq("id", req.user.id)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const profileData = {
      id: req.user.id,
      username: req.body.username,
      display_name: req.body.displayName,
      headline: req.body.headline,
      location: req.body.location,
      bio: req.body.bio,
      github_url: req.body.githubUrl,
      linkedin_url: req.body.linkedinUrl,
      website_url: req.body.websiteUrl,
      is_profile_complete: true,
    };

    // Handle profile picture upload if a file is present
    if (req.file) {
      const dataUri = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;
      const result = await uploadImage(dataUri, "devhance/profiles");
      profileData.profile_picture = result.url;
    }

    const { data, error } = await supabase
      .from("users")
      .upsert(profileData)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    res
      .status(500)
      .json({ message: "Failed to update profile", details: error.message });
  }
};

const specificUserProjects = async (req, res) => {
  try {
    // Use default Supabase client for public data
    const { createClerkSupabaseClient } = require("../config/supabase");
    const supabase = createClerkSupabaseClient();
    
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        author:users!inner (
          username
        )
      `
      )
      .eq("author.username", req.params.username)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Failed to fetch user projects" });
  }
};

module.exports = {
  userDetails,
  syncUserData,
  getPublicUser,
  updateUser,
  specificUserProjects,
};
