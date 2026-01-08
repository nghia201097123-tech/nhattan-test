import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({
    name: "users",
})
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    company_id: number;

    @Column({ default: 0 })
    role_id: number;

    @Column({ default: 0 })
    country_id: number;

    @Column({ type: 'varchar', length: 255, default: '' })
    first_name: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    last_name: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    phone_country_code: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    phone_number: string;

    @Column({ type: 'varchar', length: 255, unique: true, default: '' })
    email: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    password: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    avatar: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    identification_number: string;

    @Column({ type: 'tinyint', width: 1, default: 0 })
    gender: number;

    @Column({ type: 'date', default: '0000-00-00' })
    birthday: Date;

    @Column({ type: 'varchar', length: 255, default: '' })
    position: string;

    @Column({ type: 'text', default: '' })
    introduction: string;

    @Column({ default: 0 })
    account_type: number;

    @Column({ type: 'tinyint', width: 1, default: 0 })
    is_show_on_e_namecard: number;

    @Column({ type: 'tinyint', width: 1, default: 0 })
    is_active: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
