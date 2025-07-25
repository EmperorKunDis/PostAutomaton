import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { AssetUsage } from './asset-usage.entity';

@Entity('content_assets')
export class ContentAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20 })
  type: 'blog_post' | 'social_post' | 'reusable_snippet' | 'visual_asset' | 'media_asset';

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

  // Content references
  @Column({ type: 'uuid', name: 'blog_post_id', nullable: true })
  blogPostId?: string;

  @Column({ type: 'uuid', name: 'social_post_id', nullable: true })
  socialPostId?: string;

  @Column({ type: 'uuid', name: 'content_snippet_id', nullable: true })
  contentSnippetId?: string;

  @Column({ type: 'uuid', name: 'media_asset_id', nullable: true })
  mediaAssetId?: string;

  // Organization
  @Column({ type: 'json', default: '[]' })
  tags: string[]; // Array of tag IDs

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  // Metadata
  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Usage tracking
  @Column({ type: 'int', name: 'times_used', default: 0 })
  timesUsed: number;

  @Column({ type: 'datetime', name: 'last_used', nullable: true })
  lastUsed?: Date;

  // File info (for media assets)
  @Column({ type: 'varchar', length: 255, name: 'file_name', nullable: true })
  fileName?: string;

  @Column({ type: 'bigint', name: 'file_size', nullable: true })
  fileSize?: number;

  @Column({ type: 'varchar', length: 100, name: 'mime_type', nullable: true })
  mimeType?: string;

  @Column({ type: 'text', nullable: true })
  url?: string;

  @Column({ type: 'text', name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, { eager: false })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => AssetUsage, usage => usage.asset, { eager: false })
  usageHistory: AssetUsage[];
}