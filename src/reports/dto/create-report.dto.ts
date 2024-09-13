import { IsBoolean, IsIn, IsNotEmpty, IsObject, IsOptional, IsString, ValidateIf } from 'class-validator';
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
    @IsIn(['xlsx', 'pdf', 'docx', 'xlsx2'])
    public type: string;

    @ValidateIf(o => o.type === 'xlsx')
    @IsString()
    @IsNotEmpty()
    @IsIn(['si', 'no'])
    public templeteIsDefaul: string;

    @ValidateIf(o => o.type != 'xlsx2')
    @IsString()
    @IsNotEmpty()
    public template: string;

    @IsNotEmpty()
    @IsBoolean()
    public templateIsFile: boolean = false;

    @ValidateIf(o => o.templateIsFile === true)
    @IsString()
    @IsNotEmpty()
    @IsIn(['xlsx', 'xls', 'docx', 'doc'])
    public extTemplate: string;


    @IsObject()
    @IsOptional()
    data?: Record<string, any>;

    @ValidateIf(o => o.haveData === 'si')
    @IsObject()
    @IsNotEmpty()
    public query?: Record<string, QueryDto>;

   
}