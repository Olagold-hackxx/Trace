import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("job_applications")
export class JobApplication {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  jobId!: string;

  @Column()
  userId!: string;

  @Column("text", { nullable: true })
  coverNote?: string;

  @Column({ default: "pending" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
