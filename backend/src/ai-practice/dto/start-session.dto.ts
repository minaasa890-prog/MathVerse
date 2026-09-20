import { IsNumber } from 'class-validator';

export class StartSessionDto {

  @IsNumber()
  studentId!: number;

}