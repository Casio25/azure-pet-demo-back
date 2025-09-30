import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index} from 'typeorm';

@Entity('Users')
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index({ unique: true })
    @Column({ type: 'nvarchar', length: 255})
    email: string;

    @Column({ type: 'varbinary', length: 200})
    password_hash: Buffer;

    @CreateDateColumn({ type: 'datetime2' })
    created_at: Date;
}