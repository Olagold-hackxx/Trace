import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  postedByUserId!: string;

  @Column()
  title!: string;

  @Column()
  category!: string;

  @Column("bigint")
  payKobo!: string;

  @Column()
  durationLabel!: string;

  @Column()
  location!: string;

  @Column("text")
  description!: string;

  @Column({ default: "active" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
