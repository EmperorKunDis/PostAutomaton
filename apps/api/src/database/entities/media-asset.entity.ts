import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { AssetUsage } from './asset-usage.entity';

@Entity('media_assets')
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName: string;

  @Column({ type: 'varchar', length: 255, name: 'original_file_name' })
  originalFileName: string;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text', name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  // Media-specific metadata
  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({ type: 'int', nullable: true })
  duration?: number; // For videos in seconds

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

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Usage tracking
  @Column({ type: 'int', name: 'times_used', default: 0 })
  timesUsed: number;

  @Column({ type: 'datetime', name: 'last_used', nullable: true })
  lastUsed?: Date;

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