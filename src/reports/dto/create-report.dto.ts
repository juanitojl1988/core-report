import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, isString, IsString, ValidateIf } from 'class-validator';
import { QueryDto } from './query-report.dto';

export class CreateReportDto {

    @IsString()
    @IsNotEmpty()
    public nameReport: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['si', 'no'])
    public haveData: string;

    @IsOptional()
    public isView?: boolean;

    @IsString()
    @IsNotEmpty()
    @IsIn(['xlsx', 'pdf', 'docx'])
    public type: string;

    @IsString()
    @IsNotEmpty()
    public template: string;

    @IsNotEmpty()
    @IsBoolean()
    public templateIsFile: boolean;

    @ValidateIf(o => o.templateIsFile === true)
    @IsString()
    @IsNotEmpty()
    public extTemplate: string;


    @IsObject()
    @IsOptional()
    data?: Record<string, any>;

    @ValidateIf(o => o.haveData === 'si')
    @IsObject()
    @IsNotEmpty()
    public query?: Record<string, QueryDto>;



}