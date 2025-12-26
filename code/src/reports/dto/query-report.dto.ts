import { IsNotEmpty, IsObject, IsOptional, IsString, ValidateIf } from 'class-validator';

export class QueryDto {
    @IsString()
    @IsNotEmpty()
    key: string;

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