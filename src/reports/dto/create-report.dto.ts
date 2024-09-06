import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, ValidateIf } from 'class-validator';
import { QueryDto } from './query-report.dto';

export class CreateReportDto {

    @IsString()
    @IsNotEmpty()
    public nameReport: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['si', 'no'])
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

    @ValidateIf(o => o.haveData === 'si')
    @IsObject()
    @IsNotEmpty()
    public query?: Record<string, QueryDto>;



}