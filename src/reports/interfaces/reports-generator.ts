import { CreateReportDto } from "../dto/create-report.dto";

export interface ReportGenerator {
    generate(createReportDto: CreateReportDto): Promise<Buffer>;
}