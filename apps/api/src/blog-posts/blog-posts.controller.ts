import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { 
  GenerateBlogPostRequestDto,
  UpdateBlogPostSectionRequestDto,
  RegenerateBlogPostSectionRequestDto 
} from './dto/blog-posts.dto';
import { 
  GenerateBlogPostResponse,
  BlogPost,
  BlogPostSection,
  RegenerateBlogPostSectionRequest,
  RegenerateBlogPostSectionResponse,
  DeleteBlogPostSectionResponse,
  ApproveBlogPostRequest
} from '@internal-marketing-content-app/shared';

@Controller('blog-posts')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Post('generate')
  @RequirePermission('content:create', 'blog_posts')
  async generateBlogPost(
    @Body() generateRequest: GenerateBlogPostRequestDto,
    @Req() req: any
  ): Promise<GenerateBlogPostResponse> {
    return this.blogPostsService.generateBlogPost(generateRequest, req.user.id);
  }

  @Get('company/:companyId')
  @RequirePermission('content:read', 'blog_posts')
  async getBlogPostsByCompany(
    @Param('companyId') companyId: string,
    @Req() req: any
  ): Promise<BlogPost[]> {
    return this.blogPostsService.getBlogPostsByCompany(companyId, req.user.id);
  }

  @Get(':id')
  async getBlogPost(
    @Param('id') id: string,
    @Req() req: any
  ): Promise<BlogPost> {
    return this.blogPostsService.getBlogPost(id, req.user.id);
  }

  @Put(':id/sections/:sectionId')
  async updateBlogPostSection(
    @Param('id') blogPostId: string,
    @Param('sectionId') sectionId: string,
    @Body() updateRequest: UpdateBlogPostSectionRequestDto,
    @Req() req: any
  ): Promise<BlogPostSection> {
    return this.blogPostsService.updateBlogPostSection(
      blogPostId,
      sectionId,
      updateRequest,
      req.user.id
    );
  }

  @Post(':id/sections/:sectionId/regenerate')
  async regenerateBlogPostSection(
    @Param('id') blogPostId: string,
    @Param('sectionId') sectionId: string,
    @Body() regenerateRequest: RegenerateBlogPostSectionRequestDto,
    @Req() req: any
  ): Promise<BlogPostSection> {
    return this.blogPostsService.regenerateBlogPostSection(
      blogPostId,
      sectionId,
      regenerateRequest,
      req.user.id
    );
  }


  @Delete(':id')
  async deleteBlogPost(
    @Param('id') id: string,
    @Req() req: any
  ): Promise<void> {
    return this.blogPostsService.deleteBlogPost(id, req.user.id);
  }

  @Post(':blogPostId/sections/:sectionId/regenerate')
  async regenerateSection(
    @Param('blogPostId') blogPostId: string,
    @Param('sectionId') sectionId: string,
    @Body() regenerateRequest: RegenerateBlogPostSectionRequest,
    @Req() req: any
  ): Promise<RegenerateBlogPostSectionResponse> {
    return this.blogPostsService.regenerateSection(
      blogPostId,
      sectionId,
      regenerateRequest,
      req.user.id
    );
  }

  @Delete(':blogPostId/sections/:sectionId')
  async deleteSection(
    @Param('blogPostId') blogPostId: string,
    @Param('sectionId') sectionId: string,
    @Req() req: any
  ): Promise<DeleteBlogPostSectionResponse> {
    return this.blogPostsService.deleteSection(
      blogPostId,
      sectionId,
      req.user.id
    );
  }

  @Put(':id/approve')
  async approveBlogPost(
    @Param('id') id: string,
    @Body() approveRequest: ApproveBlogPostRequest,
    @Req() req: any
  ): Promise<BlogPost> {
    return this.blogPostsService.approveBlogPost(
      id,
      approveRequest,
      req.user.id
    );
  }
}