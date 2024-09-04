import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString } from 'class-validator';
import { QueryDto } from './query-report.dto';

export class CreateReportDto {

    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['SI', 'NO'])
    public haveData: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['xlsx', 'pdf', 'docx', 'xlsx2'])
    public type: string;

    @IsString()
    @IsNotEmpty()
    public template: string;

    @IsObject()
    @IsOptional()
    data?: Record<string, any>;

    @IsOptional()
    @IsObject()
    public query?: Record<string, QueryDto>;



}