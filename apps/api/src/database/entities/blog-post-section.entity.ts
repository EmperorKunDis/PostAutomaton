import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BlogPost } from './blog-post.entity';

@Entity('blog_post_sections')
export class BlogPostSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blogPostId: string;
  
  @ManyToOne(() => BlogPost, blogPost => blogPost.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogPostId' })
  blogPost: BlogPost;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  purpose: string; // e.g., "Introduction to challenge", "Case study/example"

  @Column()
  order: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending'
  })
  status: 'pending' | 'approved' | 'needs_revision';

  @Column({ nullable: true })
  wordCount?: number;

  @Column('simple-array', { nullable: true })
  suggestions?: string[];
}