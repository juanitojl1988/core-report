import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, ValidateIf } from 'class-validator';

export class QueryDto {


    @IsObject()
    @IsOptional()
    parameter?: Record<string, any>;

    @IsString()
    @IsNotEmpty()
    public sql: string;

    @ValidateIf(o => o.type === 'list')
    @IsObject()
    @IsNotEmpty()
    public sqlCount: string;

}