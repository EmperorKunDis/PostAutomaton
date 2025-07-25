import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { BlogPostSection } from './blog-post-section.entity';
import { ContentTopic } from './content-topic.entity';
import { WriterProfile } from './writer-profile.entity';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contentTopicId: string;
  
  @ManyToOne(() => ContentTopic)
  @JoinColumn({ name: 'contentTopicId' })
  contentTopic: ContentTopic;

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

  @Column({ nullable: true })
  writerProfileId?: string;
  
  @ManyToOne(() => WriterProfile, { nullable: true })
  @JoinColumn({ name: 'writerProfileId' })
  writerProfile?: WriterProfile;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle?: string;

  @Column('text')
  excerpt: string;

  @OneToMany(() => BlogPostSection, section => section.blogPost, { cascade: true, eager: true })
  sections: BlogPostSection[];

  @Column('text')
  fullContent: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft'
  })
  status: 'draft' | 'outline_review' | 'content_review' | 'approved' | 'published';

  @Column()
  wordCount: number;

  @Column()
  targetWordCount: number;

  @Column()
  estimatedReadTime: number;

  // SEO Metadata stored as JSON
  @Column('json')
  seoMetadata: {
    metaTitle: string;
    metaDescription: string;
    focusKeywords: string[];
    slug: string;
  };

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column({ nullable: true })
  publishedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}