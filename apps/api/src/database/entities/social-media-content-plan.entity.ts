import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { BlogPost } from './blog-post.entity';
import { Company } from './company.entity';
import { User } from './user.entity';
import { SocialMediaPost } from './social-media-post.entity';
import { SocialMediaPlatform } from '@internal-marketing-content-app/shared';

@Entity('social_media_content_plans')
export class SocialMediaContentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blogPostId: string;
  
  @ManyToOne(() => BlogPost)
  @JoinColumn({ name: 'blogPostId' })
  blogPost: BlogPost;

  @Column()
  companyId: string;
  
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  userId: string;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => SocialMediaPost, post => post.contentPlan, { cascade: true, eager: true })
  posts: SocialMediaPost[];

  @Column('simple-array')
  selectedPlatforms: SocialMediaPlatform[];

  @Column('simple-array')
  selectedWriterProfiles: string[];

  @Column({ type: 'varchar', length: 20, default: 'weekly' })
  publishingFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'approved' | 'active' | 'completed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}