import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { BlogPost } from './blog-post.entity';
import { WriterProfile } from './writer-profile.entity';
import { SocialMediaContentPlan } from './social-media-content-plan.entity';
import { SocialMediaPlatform } from '@internal-marketing-content-app/shared';

@Entity('social_media_posts')
export class SocialMediaPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blogPostId: string;
  
  @ManyToOne(() => BlogPost)
  @JoinColumn({ name: 'blogPostId' })
  blogPost: BlogPost;

  @Column()
  contentPlanId: string;
  
  @ManyToOne(() => SocialMediaContentPlan, plan => plan.posts)
  @JoinColumn({ name: 'contentPlanId' })
  contentPlan: SocialMediaContentPlan;

  @Column({ type: 'varchar', length: 20 })
  platform: SocialMediaPlatform;

  @Column()
  writerProfileId: string;
  
  @ManyToOne(() => WriterProfile)
  @JoinColumn({ name: 'writerProfileId' })
  writerProfile: WriterProfile;

  @Column('text')
  content: string;

  @Column('simple-array')
  hashtags: string[];

  @Column('simple-array')
  emojis: string[];

  @Column({ nullable: true })
  callToAction?: string;

  @Column()
  characterCount: number;

  @Column({ type: 'varchar', length: 20, default: 'text' })
  mediaType: 'text' | 'image' | 'video' | 'carousel';

  @Column('json', { nullable: true })
  visualConcepts?: any[]; // Will store VisualConcept objects

  @Column({ type: 'varchar', length: 20 })
  angle: 'technical' | 'emotional' | 'news' | 'educational' | 'inspirational';

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'approved' | 'scheduled' | 'published';

  @Column({ nullable: true })
  scheduledFor?: Date;

  @Column({ nullable: true })
  publishedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}