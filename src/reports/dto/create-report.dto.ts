import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString } from 'class-validator';

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
    @IsIn(['xlsx', 'pdf', 'docx'])
    public type: string;

    @IsString()
    @IsNotEmpty()
    public template: string;

    @IsObject()
    @IsOptional()
    data?: Record<string, any>;

    @IsObject()
    @IsOptional()
    parameter?: Record<string, any>;

    @IsString()
    public sql?: string;

    @IsObject()
    @IsOptional()
    images?: Record<string, string>;  // Imágenes en base64 como un objeto de clave-valor

}