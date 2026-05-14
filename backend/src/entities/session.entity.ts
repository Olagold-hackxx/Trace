import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity("sessions")
export class Session {
  @PrimaryColumn()
  token!: string;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
