import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export class Generic {
  @CreateDateColumn()
  CreatedAt?: Date;

  @DeleteDateColumn()
  DeletedAt?: Date;

  @UpdateDateColumn()
  UpdatedAt?: Date;
}