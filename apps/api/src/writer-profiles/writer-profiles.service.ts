import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WriterProfile } from '../database/entities/writer-profile.entity';
import { Company } from '../database/entities/company.entity';
import { CompanyContext } from '../database/entities/company-context.entity';
import { User } from '../database/entities/user.entity';
import { CreateWriterProfileDto, UpdateWriterProfileDto, GenerateWriterProfilesDto } from './dto/writer-profiles.dto';
import { WriterTone, WriterStyle, WriterProfileGeneration } from '@internal-marketing-content-app/shared';

interface ProfileTemplate {
  name: string;
  position: string;
  tone: WriterTone;
  style: WriterStyle;
  targetAudience: string;
  contentFocusAreas: string[];
  companyFocusTips: string[];
}

@Injectable()
export class WriterProfilesService {
  constructor(
    @InjectRepository(WriterProfile)
    private writerProfileRepository: Repository<WriterProfile>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(CompanyContext)
    private companyContextRepository: Repository<CompanyContext>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async generateProfiles(generateDto: GenerateWriterProfilesDto): Promise<WriterProfileGeneration> {
    const { companyId, userId, count = 3 } = generateDto;

    // Verify company and user exist
    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get or create company context
    let companyContext = await this.companyContextRepository.findOne({ where: { companyId } });
    if (!companyContext) {
      throw new NotFoundException('Company context not found. Please analyze company first.');
    }

    // Generate writer profiles based on company context
    const profileTemplates = this.generateProfileTemplates(company, companyContext, count);
    
    // Create and save profiles
    const profiles: WriterProfile[] = [];
    for (const template of profileTemplates) {
      const profile = this.writerProfileRepository.create({
        companyId,
        userId,
        name: template.name,
        position: template.position,
        tone: template.tone,
        style: template.style,
        targetAudience: template.targetAudience,
        contentFocusAreas: template.contentFocusAreas,
        socialPlatforms: [], // Will be set later via platform selection
        companyFocusTips: template.companyFocusTips,
        isCustom: false,
        isActive: true
      });

      const savedProfile = await this.writerProfileRepository.save(profile);
      profiles.push(savedProfile);
    }

    // Generate suggested social platforms
    const suggestedPlatforms = this.generateSuggestedPlatforms(companyContext);

    return {
      profiles,
      companyContext,
      suggestedPlatforms
    };
  }

  async getByCompanyAndUser(companyId: string, userId: string, activeOnly = true): Promise<WriterProfile[]> {
    const where: any = { companyId, userId };
    if (activeOnly) {
      where.isActive = true;
    }

    return await this.writerProfileRepository.find({
      where,
      relations: ['company', 'user'],
      order: { createdAt: 'ASC' }
    });
  }

  async getById(id: string): Promise<WriterProfile> {
    const profile = await this.writerProfileRepository.findOne({
      where: { id },
      relations: ['company', 'user']
    });

    if (!profile) {
      throw new NotFoundException('Writer profile not found');
    }

    return profile;
  }

  async create(createDto: CreateWriterProfileDto): Promise<WriterProfile> {
    // Verify company and user exist
    const company = await this.companyRepository.findOne({ where: { id: createDto.companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const user = await this.userRepository.findOne({ where: { id: createDto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = this.writerProfileRepository.create({
      ...createDto,
      isCustom: true, // User-created profiles are marked as custom
      isActive: true
    });

    return await this.writerProfileRepository.save(profile);
  }

  async update(id: string, updateDto: UpdateWriterProfileDto): Promise<WriterProfile> {
    const profile = await this.getById(id);
    
    // If any content is modified, mark as custom
    const contentFields = ['name', 'position', 'tone', 'style', 'targetAudience', 'contentFocusAreas', 'companyFocusTips'];
    const isContentModified = contentFields.some(field => updateDto[field] !== undefined);
    
    if (isContentModified && !profile.isCustom) {
      updateDto = { ...updateDto, isCustom: true };
    }

    Object.assign(profile, updateDto);
    return await this.writerProfileRepository.save(profile);
  }

  async delete(id: string): Promise<void> {
    const profile = await this.getById(id);
    await this.writerProfileRepository.remove(profile);
  }

  async updateSocialPlatforms(id: string, socialPlatforms: string[]): Promise<WriterProfile> {
    const profile = await this.getById(id);
    profile.socialPlatforms = socialPlatforms;
    return await this.writerProfileRepository.save(profile);
  }

  private generateProfileTemplates(company: Company, context: CompanyContext, count: number): ProfileTemplate[] {
    const industry = company.industry.toLowerCase();
    const profiles: ProfileTemplate[] = [];

    // Get industry-specific base templates
    const baseTemplates = this.getIndustryTemplates(industry);
    
    // Generate profiles based on company size and target market
    const selectedTemplates = this.selectTemplates(baseTemplates, context, count);
    
    // Customize templates with company-specific information
    for (const template of selectedTemplates) {
      profiles.push(this.customizeTemplate(template, company, context));
    }

    return profiles;
  }

  private getIndustryTemplates(industry: string): ProfileTemplate[] {
    const industryTemplateMap: Record<string, ProfileTemplate[]> = {
      'technology': [
        {
          name: 'Tech Innovator Voice',
          position: 'Technical Leader',
          tone: 'Technical',
          style: 'Informative',
          targetAudience: 'Technical Professionals',
          contentFocusAreas: ['Technical Innovation', 'Product Development', 'Industry Trends', 'Best Practices'],
          companyFocusTips: []
        },
        {
          name: 'Product Marketing Voice',
          position: 'Product Marketing Manager',
          tone: 'Professional',
          style: 'Persuasive',
          targetAudience: 'Business Decision Makers',
          contentFocusAreas: ['Product Features', 'Market Solutions', 'Customer Success', 'ROI Insights'],
          companyFocusTips: []
        },
        {
          name: 'Thought Leader Voice',
          position: 'Technology Evangelist',
          tone: 'Inspirational',
          style: 'Educational',
          targetAudience: 'Industry Peers',
          contentFocusAreas: ['Future of Technology', 'Industry Insights', 'Innovation Trends', 'Digital Transformation'],
          companyFocusTips: []
        }
      ],
      'healthcare': [
        {
          name: 'Clinical Expert Voice',
          position: 'Medical Professional',
          tone: 'Professional',
          style: 'Informative',
          targetAudience: 'Healthcare Professionals',
          contentFocusAreas: ['Clinical Excellence', 'Patient Care', 'Medical Innovation', 'Treatment Outcomes'],
          companyFocusTips: []
        },
        {
          name: 'Patient Advocate Voice',
          position: 'Patient Relations Specialist',
          tone: 'Friendly',
          style: 'Educational',
          targetAudience: 'Patients and Families',
          contentFocusAreas: ['Patient Education', 'Health & Wellness', 'Treatment Support', 'Community Health'],
          companyFocusTips: []
        },
        {
          name: 'Healthcare Leader Voice',
          position: 'Healthcare Executive',
          tone: 'Professional',
          style: 'Analytical',
          targetAudience: 'Healthcare Decision Makers',
          contentFocusAreas: ['Healthcare Policy', 'Industry Trends', 'Quality Improvement', 'Healthcare Innovation'],
          companyFocusTips: []
        }
      ],
      'finance': [
        {
          name: 'Financial Advisor Voice',
          position: 'Senior Financial Consultant',
          tone: 'Professional',
          style: 'Analytical',
          targetAudience: 'Individual Investors',
          contentFocusAreas: ['Investment Strategies', 'Financial Planning', 'Market Analysis', 'Risk Management'],
          companyFocusTips: []
        },
        {
          name: 'Market Analyst Voice',
          position: 'Market Research Analyst',
          tone: 'Technical',
          style: 'Informative',
          targetAudience: 'Financial Professionals',
          contentFocusAreas: ['Market Trends', 'Economic Insights', 'Investment Research', 'Financial Data'],
          companyFocusTips: []
        },
        {
          name: 'Client Relations Voice',
          position: 'Client Success Manager',
          tone: 'Friendly',
          style: 'Educational',
          targetAudience: 'Current Clients',
          contentFocusAreas: ['Client Education', 'Service Updates', 'Financial Tips', 'Success Stories'],
          companyFocusTips: []
        }
      ]
    };

    // Return industry-specific templates or generic ones
    return industryTemplateMap[industry] || this.getGenericTemplates();
  }

  private getGenericTemplates(): ProfileTemplate[] {
    return [
      {
        name: 'Company Leader Voice',
        position: 'Executive Leadership',
        tone: 'Professional',
        style: 'Informative',
        targetAudience: 'Industry Professionals',
        contentFocusAreas: ['Industry Leadership', 'Company Vision', 'Market Insights', 'Business Strategy'],
        companyFocusTips: []
      },
      {
        name: 'Customer Success Voice',
        position: 'Customer Success Manager',
        tone: 'Friendly',
        style: 'Educational',
        targetAudience: 'Current and Potential Customers',
        contentFocusAreas: ['Customer Success', 'Product Education', 'Best Practices', 'Case Studies'],
        companyFocusTips: []
      },
      {
        name: 'Industry Expert Voice',
        position: 'Subject Matter Expert',
        tone: 'Professional',
        style: 'Analytical',
        targetAudience: 'Industry Peers',
        contentFocusAreas: ['Industry Trends', 'Expert Insights', 'Research Findings', 'Professional Development'],
        companyFocusTips: []
      }
    ];
  }

  private selectTemplates(baseTemplates: ProfileTemplate[], context: CompanyContext, count: number): ProfileTemplate[] {
    // For now, return the first 'count' templates
    // In the future, this could be more intelligent based on company context
    return baseTemplates.slice(0, Math.min(count, baseTemplates.length));
  }

  private customizeTemplate(template: ProfileTemplate, company: Company, context: CompanyContext): ProfileTemplate {
    // Customize company focus tips based on company and context
    const customizedTips = this.generateCompanyFocusTips(template, company, context);
    
    return {
      ...template,
      companyFocusTips: customizedTips
    };
  }

  private generateCompanyFocusTips(template: ProfileTemplate, company: Company, context: CompanyContext): string[] {
    const tips: string[] = [];
    
    // Base tips from company context
    tips.push(`Emphasize ${company.name}'s position as a ${context.companySizeIndicator} in the ${context.industryVertical} sector`);
    tips.push(`Target ${context.targetMarket} audiences with content that resonates with their specific needs`);
    
    // Add location-based tip
    if (company.location?.city && company.location?.country) {
      tips.push(`Leverage ${company.location.city}, ${company.location.country} market presence and local insights`);
    }
    
    // Add differentiation tips
    if (context.keyDifferentiators?.length > 0) {
      tips.push(`Highlight key differentiators: ${context.keyDifferentiators.slice(0, 2).join(', ')}`);
    }
    
    // Add brand personality tip
    if (context.brandPersonality?.length > 0) {
      tips.push(`Maintain brand personality: ${context.brandPersonality.slice(0, 3).join(', ')}`);
    }
    
    // Role-specific tips
    if (template.position.toLowerCase().includes('technical')) {
      tips.push('Include technical depth while remaining accessible to your target audience');
    } else if (template.position.toLowerCase().includes('marketing')) {
      tips.push('Focus on customer benefits and business value propositions');
    } else if (template.position.toLowerCase().includes('executive')) {
      tips.push('Provide strategic insights and industry leadership perspectives');
    }
    
    return tips;
  }

  private generateSuggestedPlatforms(context: CompanyContext): any[] {
    // This would typically come from a platforms database/service
    // For now, return a static list based on target market
    const allPlatforms = [
      {
        id: 'linkedin',
        name: 'linkedin',
        displayName: 'LinkedIn',
        description: 'Professional networking and B2B content',
        characterLimit: 3000,
        mediaSupport: ['image', 'video', 'document'],
        audienceType: 'Professional',
        contentFormats: ['post', 'article'],
        isActive: true,
        category: 'professional'
      },
      {
        id: 'twitter',
        name: 'twitter',
        displayName: 'X (Twitter)',
        description: 'Real-time updates and industry conversations',
        characterLimit: 280,
        mediaSupport: ['image', 'video'],
        audienceType: 'General',
        contentFormats: ['post', 'thread'],
        isActive: true,
        category: 'social'
      },
      {
        id: 'facebook',
        name: 'facebook',
        displayName: 'Facebook',
        description: 'Community building and customer engagement',
        characterLimit: 63206,
        mediaSupport: ['image', 'video'],
        audienceType: 'General',
        contentFormats: ['post', 'story'],
        isActive: true,
        category: 'social'
      },
      {
        id: 'instagram',
        name: 'instagram',
        displayName: 'Instagram',
        description: 'Visual storytelling and brand building',
        characterLimit: 2200,
        mediaSupport: ['image', 'video'],
        audienceType: 'Visual',
        contentFormats: ['post', 'story', 'reel'],
        isActive: true,
        category: 'visual'
      }
    ];

    // Filter platforms based on target market
    if (context.targetMarket === 'B2B') {
      return allPlatforms.filter(p => ['linkedin', 'twitter'].includes(p.name));
    } else if (context.targetMarket === 'B2C') {
      return allPlatforms.filter(p => ['facebook', 'instagram', 'twitter'].includes(p.name));
    } else {
      // B2B2C - return all
      return allPlatforms;
    }
  }
}