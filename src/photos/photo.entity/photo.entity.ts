import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('Photos')
export class Photo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uniqueidentifier' })
    user_id: string;

    @Column({ type: 'nvarchar', length: 512 })
    blob_name: string;

    @CreateDateColumn({ type: 'datetime2' })
    created_at: Date;
}
