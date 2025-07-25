import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { User } from './user.entity';
import { BlogPost } from './blog-post.entity';
import { BlogPostSection } from './blog-post-section.entity';
import { SocialMediaPost } from './social-media-post.entity';
import { 
  CommentEntityType, 
  CommentStatus 
} from '@internal-marketing-content-app/shared';

@Entity('comments')
@Index(['entityType', 'entityId'])
@Index(['sectionId', 'paragraphIndex'])
@Index(['userId', 'createdAt'])
@Index(['parentCommentId'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50
  })
  entityType: CommentEntityType;

  @Column('uuid')
  entityId: string;

  // Relations to different entity types
  @ManyToOne(() => BlogPost, { nullable: true })
  @JoinColumn({ name: 'entityId' })
  blogPost?: BlogPost;

  @ManyToOne(() => SocialMediaPost, { nullable: true })
  @JoinColumn({ name: 'entityId' })
  socialPost?: SocialMediaPost;

  // For blog post sections and paragraphs
  @Column({ type: 'uuid', nullable: true })
  sectionId?: string;

  @ManyToOne(() => BlogPostSection, { nullable: true })
  @JoinColumn({ name: 'sectionId' })
  section?: BlogPostSection;

  @Column({ type: 'int', nullable: true })
  paragraphIndex?: number;

  // Comment content
  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'active'
  })
  status: CommentStatus;

  // User information
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  userName: string;

  @Column({ type: 'varchar', length: 50 })
  userRole: string;

  // Threading
  @Column({ type: 'uuid', nullable: true })
  parentCommentId?: string;

  @ManyToOne(() => Comment, comment => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment?: Comment;

  @OneToMany(() => Comment, comment => comment.parentComment)
  replies: Comment[];

  @Column({ type: 'int', default: 0 })
  replyCount: number;

  // Mentions
  @Column({ type: 'json', nullable: true })
  mentions: string[];

  // Position (for inline comments)
  @Column({ type: 'int', nullable: true })
  selectionStart?: number;

  @Column({ type: 'int', nullable: true })
  selectionEnd?: number;

  @Column({ type: 'text', nullable: true })
  selectedText?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  editedAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  resolvedBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolvedBy' })
  resolver?: User;
}