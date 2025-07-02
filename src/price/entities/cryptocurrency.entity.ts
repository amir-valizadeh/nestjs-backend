import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cryptocurrencies')
export class Cryptocurrency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  symbol: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  currentPrice: number;

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  priceChange: number;

  @Column('decimal', { precision: 8, scale: 4, default: 0 })
  priceChangePercent: number;

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  high24h: number;

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  low24h: number;

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  volume24h: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPopular: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
