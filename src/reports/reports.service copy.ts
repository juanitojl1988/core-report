/* import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as jsreport from 'jsreport';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryService } from 'src/query/query.service';
import { QueryDto } from './dto/query-report.dto';
import * as fs from 'fs';
import { FileDownloader } from 'src/util/util-downloadFile';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ReportsService {

  private jsreportInstance;
  private fileDownloader: FileDownloader;
  private readonly logger = new Logger('ReportsService');
  private readonly TYPE_QUERY_LIST: string = 'list';
  private readonly TYPE_QUERY_ONE: string = 'one';
  private readonly LIMIT_GROUP: number = 100;

  constructor(private readonly queryService: QueryService, private readonly httpService: HttpService) {
    this.jsreportInstance = jsreport();
    this.fileDownloader = new FileDownloader(this.httpService);
    this.jsreportInstance.init().catch((err) => {
      console.error('Error al iniciar jsreport:', err);
    });
  }


  async generateReportOfTemplateDocx(createReportDto: CreateReportDto): Promise<Buffer> {
    let data: Record<string, any> = {};
    const { template, haveData, query } = createReportDto;
    //const fileTemplate = await this.fileDownloader.downloadFile(template, ".docx");
    // const templateContent = await fs.promises.readFile(fileTemplate);
    const templateContent = await fs.promises.readFile("D:\\PROJECT_JP\\reportNS\\core-report\\dist\\temp_templates\\temp1.docx");
    this.logger.log('Ruta Plantilla:', templateContent);
    if (haveData === 'no')
      data = await this.extractData(query);
    else
      data = createReportDto.data;
    data = {
      users: [
        { name: 'Juan Pérez', email: 'juan.perez@example.com' },
        { name: 'María López', email: 'maria.lopez@example.com' },
      ],
    };
    try {
      const response = await this.jsreportInstance.render({
        template: {
          // content: templateContent,
          recipe: 'docx',
          engine: 'handlebars', // No usar un motor si estamos usando un activo
          docx: {
            templateAsset: {
              content: await fs.promises.readFile('D:\\PROJECT_JP\\reportNS\\core-report\\dist\\temp_templates\\temp1.docx', 'base64'),  // Base DOCX en base64
              encoding: 'base64'
            }
          }
        },
        data: data,
      });
      return response.content;
    } catch (err) {
      console.error('Error al generar el reporte:', err);
      throw err;
    }
  }

  async generateReportExcel(createReportDto: CreateReportDto): Promise<Buffer> {
    let data: Record<string, any> = {};
    const { template, haveData, query } = createReportDto;
    if (haveData === 'no')
      data = await this.extractData(query);
    else
      data = createReportDto.data;
    try {
      const response = await this.jsreportInstance.render({
        template: {
          content: template,
          engine: 'handlebars',
          recipe: 'html-to-xlsx',
        },
        data,
      });
      return response.content;
    } catch (err) {
      console.error('Error al generar el reporte:', err);
      throw err;
    }
  }


  async generateReportPdf(createReportDto: CreateReportDto): Promise<Buffer> {
    let data: Record<string, any> = {};
    const { template, haveData, query } = createReportDto;
    if (haveData === 'no')
      data = await this.extractData(query);
    else
      data = createReportDto.data;
    try {
      const response = await this.jsreportInstance.render({
        template: {
          content: template,
          engine: 'handlebars',
          recipe: 'chrome-pdf',
          chrome: {
            printBackground: true,
            marginTop: '1cm',
            marginBottom: '1cm',
            marginLeft: '1cm',
            marginRight: '1cm',
            printHeaderFooter: false
          }
        },
        data,
      });
      return response.content;
    } catch (err) {
      console.error('Error al generar el reporte:', err);
      throw err;
    }
  }

  async extractData(query: Record<string, QueryDto>) {
    if (!query || Object.keys(query).length <= 0) {
      return {};
    }
    const myData: Record<string, any> = {};
    try {
      //Extracion de data una fila
      const queryOne = query[this.TYPE_QUERY_ONE];
      if (queryOne) {
        const dataOne = await this.queryService.executeQueryOne(queryOne);
        myData[this.TYPE_QUERY_ONE] = dataOne[0];
      }

      //Extracion de data varias filas
      const queryList = query[this.TYPE_QUERY_LIST];
      if (queryList) {
        const dataList = await this.queryService.executeQuery(queryList, this.LIMIT_GROUP);
        myData[this.TYPE_QUERY_LIST] = dataList;
      }
      return myData;
    } catch (error) {
      this.logger.error("Error al extractData: " + error.message);
      throw new InternalServerErrorException("Error al extractData: " + error.message);
    }
  }


  async generateReport(createReportDto: CreateReportDto): Promise<Buffer> {
    try {
      const { template, type, data } = createReportDto;
      let recipe;
      switch (type) {
        case 'pdf':
          recipe = 'chrome-pdf';//'html-to-pdf';
          break;
        case 'docx':
          recipe = 'html-to-docx';
          break;
        case 'xlsx':
          recipe = 'html-to-xlsx';
          break;
        case 'xlsx2':
          recipe = 'xlsx';
          break;
        default:
          throw new Error('Formato no soportado');
      }

      const response = await this.jsreportInstance.render({
        template: {
          content: template,
          engine: 'handlebars',
          recipe: recipe,
        },
        data,
      });

      return response.content;
    } catch (err) {
      console.error('Error al generar el reporte:', err);
      throw err;
    }
  }
}
 */