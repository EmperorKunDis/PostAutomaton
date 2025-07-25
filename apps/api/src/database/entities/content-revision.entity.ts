import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { BlogPost } from './blog-post.entity';
import { BlogPostSection } from './blog-post-section.entity';
import { SocialMediaPost } from './social-media-post.entity';
import { ReusableSnippet } from './reusable-snippet.entity';
import { 
  ChangeType, 
  ChangeSource 
} from '@internal-marketing-content-app/shared';

@Entity('content_revisions')
@Index(['blogPostId', 'changedAt'])
@Index(['socialPostId', 'changedAt'])
@Index(['snippetId', 'changedAt'])
@Index(['changedBy', 'changedAt'])
export class ContentRevision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Entity relations
  @Column({ type: 'uuid', nullable: true })
  blogPostId: string;

  @ManyToOne(() => BlogPost, { nullable: true })
  @JoinColumn({ name: 'blogPostId' })
  blogPost: BlogPost;

  @Column({ type: 'uuid', nullable: true })
  socialPostId: string;

  @ManyToOne(() => SocialMediaPost, { nullable: true })
  @JoinColumn({ name: 'socialPostId' })
  socialPost: SocialMediaPost;

  @Column({ type: 'uuid', nullable: true })
  snippetId: string;

  @ManyToOne(() => ReusableSnippet, { nullable: true })
  @JoinColumn({ name: 'snippetId' })
  snippet: ReusableSnippet;

  // Paragraph-level tracking for blog posts
  @Column({ type: 'uuid', nullable: true })
  sectionId: string;

  @ManyToOne(() => BlogPostSection, { nullable: true })
  @JoinColumn({ name: 'sectionId' })
  section: BlogPostSection;

  @Column({ type: 'int', nullable: true })
  paragraphIndex: number;

  // Version info
  @Column('int')
  fromVersion: number;

  @Column('int')
  toVersion: number;

  // Change details
  @Column({
    type: 'varchar',
    length: 50
  })
  changeType: ChangeType;

  @Column({
    type: 'varchar',
    length: 50
  })
  changeSource: ChangeSource;

  @Column('uuid')
  changedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changedBy' })
  user: User;

  @CreateDateColumn()
  changedAt: Date;

  // Content changes
  @Column({ type: 'text' })
  previousContent: string;

  @Column({ type: 'text' })
  newContent: string;

  @Column({ type: 'json' })
  contentDiff: any;

  // Metadata
  @Column({ type: 'text', nullable: true })
  changeNotes: string;

  @Column({ type: 'text', nullable: true })
  aiPrompt: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  aiModel: string;
}