import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsObject, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { QueryDto } from './query-report.dto';
import { Type } from 'class-transformer';

export class QuerySectionDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QueryDto)
    one: QueryDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QueryDto)
    list: QueryDto[];
}

export class CreateReportDto {

    @IsString()
    @IsNotEmpty()
    public nameReport: string;

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

    @ValidateIf(o => o.type == 'xlsx2')
    @IsString()
    @IsIn(['si', 'no'])
    public paginator: string = 'no';

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

    @IsOptional()                         // Permite que sea undefined si la condición de arriba no se cumple
    @ValidateNested()                     // Valida las propiedades internas de la clase
    @Type(() => QuerySectionDto)          // Transforma el JSON a la instancia de clase correcta
    query?: QuerySectionDto;              // Usamos la clase específica, no un Record genérico


}