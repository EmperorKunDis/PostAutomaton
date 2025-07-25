import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ContentAsset } from './content-asset.entity';
import { User } from './user.entity';

@Entity('asset_usage')
export class AssetUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'asset_id' })
  assetId: string;

  @Column({ type: 'varchar', length: 20, name: 'used_in_type' })
  usedInType: 'blog_post' | 'social_post' | 'campaign';

  @Column({ type: 'varchar', length: 255, name: 'used_in_id' })
  usedInId: string;

  @CreateDateColumn({ name: 'used_at' })
  usedAt: Date;

  @Column({ type: 'uuid', name: 'used_by' })
  usedBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  platform?: string; // For social posts

  // Relations
  @ManyToOne(() => ContentAsset, asset => asset.usageHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: ContentAsset;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'used_by' })
  user: User;
}