import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('portfolios')
@Index(['userId', 'createdAt'])
@Index(['userId', 'purchaseDate'])
@Index(['cryptocurrencyType'])
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  cryptocurrencyType: string;

  @Column('decimal', { precision: 18, scale: 8 })
  amount: number;

  @Column()
  @Index()
  userId: number;

  @Column()
  @Index()
  purchaseDate: Date;

  @Column('decimal', { precision: 18, scale: 2 })
  purchasePrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.portfolios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
