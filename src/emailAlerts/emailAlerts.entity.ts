import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class EmailAlertsEntity {

    @PrimaryGeneratedColumn()
    objectId: number;

}
