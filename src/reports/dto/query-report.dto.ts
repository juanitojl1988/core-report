import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString } from 'class-validator';

export class QueryDto {

    @IsString()
    @IsNotEmpty()
    public sql: string;

    @IsString()
    @IsNotEmpty()
    public sqlCount: string;

}