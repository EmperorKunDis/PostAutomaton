import { create } from 'zustand';
import {
  BlogPost,
  GenerateBlogPostRequest,
  UpdateBlogPostSectionRequest,
  BlogPostSection,
  RegenerateBlogPostSectionRequest,
  ApproveBlogPostRequest
} from '@internal-marketing-content-app/shared';
import { blogPostService } from '../services/blogPostService';

interface BlogPostState {
  blogPosts: BlogPost[];
  currentBlogPost: BlogPost | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  // Actions
  generateBlogPost: (request: GenerateBlogPostRequest) => Promise<BlogPost>;
  getBlogPost: (id: string) => Promise<BlogPost>;
  getBlogPosts: (companyId?: string) => Promise<void>;
  updateBlogPostSection: (
    blogPostId: string,
    sectionId: string,
    request: UpdateBlogPostSectionRequest
  ) => Promise<void>;
  regenerateSection: (
    blogPostId: string,
    sectionId: string,
    request: RegenerateBlogPostSectionRequest
  ) => Promise<void>;
  deleteSection: (blogPostId: string, sectionId: string) => Promise<void>;
  approveBlogPost: (blogPostId: string, request: ApproveBlogPostRequest) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  setCurrentBlogPost: (blogPost: BlogPost | null) => void;
  clearError: () => void;
}

export const useBlogPostStore = create<BlogPostState>((set, get) => ({
  blogPosts: [],
  currentBlogPost: null,
  isLoading: false,
  isGenerating: false,
  error: null,

  generateBlogPost: async (request: GenerateBlogPostRequest) => {
    try {
      set({ isGenerating: true, error: null });
      
      const response = await blogPostService.generateBlogPost(request);
      const newBlogPost = response.blogPost;
      
      set((state) => ({
        blogPosts: [newBlogPost, ...state.blogPosts],
        currentBlogPost: newBlogPost,
        isGenerating: false
      }));
      
      return newBlogPost;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate blog post';
      set({ error: errorMessage, isGenerating: false });
      throw error;
    }
  },

  getBlogPost: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const blogPost = await blogPostService.getBlogPost(id);
      
      set({ currentBlogPost: blogPost, isLoading: false });
      return blogPost;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load blog post';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getBlogPosts: async (companyId?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const blogPosts = await blogPostService.getBlogPosts(companyId);
      
      set({ blogPosts, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load blog posts';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateBlogPostSection: async (
    blogPostId: string,
    sectionId: string,
    request: UpdateBlogPostSectionRequest
  ) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await blogPostService.updateBlogPostSection(blogPostId, sectionId, request);
      const updatedSection = response.section;
      
      // Update the current blog post with the new section
      const { currentBlogPost } = get();
      if (currentBlogPost && currentBlogPost.id === blogPostId) {
        const updatedBlogPost = {
          ...currentBlogPost,
          sections: currentBlogPost.sections.map((section) =>
            section.id === sectionId ? updatedSection : section
          )
        };
        set({ currentBlogPost: updatedBlogPost });
      }
      
      // Update the blog posts list
      set((state) => ({
        blogPosts: state.blogPosts.map((post) =>
          post.id === blogPostId
            ? {
                ...post,
                sections: post.sections.map((section) =>
                  section.id === sectionId ? updatedSection : section
                )
              }
            : post
        ),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update section';
      set({ error: errorMessage, isLoading: false });
    }
  },

  regenerateSection: async (
    blogPostId: string,
    sectionId: string,
    request: RegenerateBlogPostSectionRequest
  ) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await blogPostService.regenerateSection(blogPostId, sectionId, request);
      const updatedSection = response.section;
      
      // Update the section in both currentBlogPost and blogPosts array
      set((state) => {
        const currentBlogPost = state.currentBlogPost;
        if (currentBlogPost && currentBlogPost.id === blogPostId) {
          const updatedBlogPost = {
            ...currentBlogPost,
            sections: currentBlogPost.sections.map((section) =>
              section.id === sectionId ? updatedSection : section
            )
          };
          
          return {
            currentBlogPost: updatedBlogPost,
            blogPosts: state.blogPosts.map((post) =>
              post.id === blogPostId ? updatedBlogPost : post
            ),
            isLoading: false
          };
        }
        
        return {
          blogPosts: state.blogPosts.map((post) =>
            post.id === blogPostId
              ? {
                  ...post,
                  sections: post.sections.map((section) =>
                    section.id === sectionId ? updatedSection : section
                  )
                }
              : post
          ),
          isLoading: false
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate section';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteSection: async (blogPostId: string, sectionId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await blogPostService.deleteSection(blogPostId, sectionId);
      
      // Remove the section from both currentBlogPost and blogPosts array
      set((state) => {
        const currentBlogPost = state.currentBlogPost;
        if (currentBlogPost && currentBlogPost.id === blogPostId) {
          const updatedBlogPost = {
            ...currentBlogPost,
            sections: currentBlogPost.sections
              .filter((section) => section.id !== sectionId)
              .map((section, index) => ({ ...section, order: index + 1 }))
          };
          
          return {
            currentBlogPost: updatedBlogPost,
            blogPosts: state.blogPosts.map((post) =>
              post.id === blogPostId ? updatedBlogPost : post
            ),
            isLoading: false
          };
        }
        
        return {
          blogPosts: state.blogPosts.map((post) =>
            post.id === blogPostId
              ? {
                  ...post,
                  sections: post.sections
                    .filter((section) => section.id !== sectionId)
                    .map((section, index) => ({ ...section, order: index + 1 }))
                }
              : post
          ),
          isLoading: false
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete section';
      set({ error: errorMessage, isLoading: false });
    }
  },

  approveBlogPost: async (blogPostId: string, request: ApproveBlogPostRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedBlogPost = await blogPostService.approveBlogPost(blogPostId, request);
      
      set((state) => ({
        currentBlogPost: state.currentBlogPost?.id === blogPostId 
          ? updatedBlogPost 
          : state.currentBlogPost,
        blogPosts: state.blogPosts.map((post) =>
          post.id === blogPostId ? updatedBlogPost : post
        ),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve blog post';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteBlogPost: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await blogPostService.deleteBlogPost(id);
      
      set((state) => ({
        blogPosts: state.blogPosts.filter((post) => post.id !== id),
        currentBlogPost: state.currentBlogPost?.id === id ? null : state.currentBlogPost,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete blog post';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setCurrentBlogPost: (blogPost: BlogPost | null) => {
    set({ currentBlogPost: blogPost });
  },

  clearError: () => {
    set({ error: null });
  },
}));