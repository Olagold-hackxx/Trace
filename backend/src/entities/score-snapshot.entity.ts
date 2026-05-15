import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("score_snapshots")
export class ScoreSnapshot {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column()
  score!: number;

  @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
  pd?: number;

  @Column({ type: "jsonb", default: {} })
  subScores!: Record<string, unknown>;

  @Column({ type: "jsonb", default: [] })
  factors!: Array<Record<string, unknown>>;

  @Column({ default: "seeded-v1" })
  modelVersion!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
