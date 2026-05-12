import { Body, Controller, Get, Param, Post, Version } from "@nestjs/common";
import { CreateJobDto } from "./dto/create-job.dto";
import { JobsService } from "./jobs.service";

@Controller()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Version("1")
  @Get("jobs/mine")
  getMyJobs() {
    return this.jobsService.getMyJobs();
  }

  @Version("1")
  @Post("jobs")
  createJob(@Body() dto: CreateJobDto) {
    return this.jobsService.createJob(dto);
  }

  @Version("1")
  @Get("jobs/:jobId")
  getJob(@Param("jobId") jobId: string) {
    return this.jobsService.getJob(jobId);
  }

  @Version("1")
  @Get("jobs/:jobId/applications")
  getJobApplications(@Param("jobId") jobId: string) {
    return this.jobsService.getJobApplications(jobId);
  }

  @Version("1")
  @Get("job-applications/mine")
  getMyApplications() {
    return this.jobsService.getMyApplications();
  }

  @Version("1")
  @Get("marketplace/jobs")
  getMarketplaceJobs() {
    return this.jobsService.getMarketplaceJobs();
  }

  @Version("1")
  @Get("marketplace/jobs/:jobId")
  getMarketplaceJob(@Param("jobId") jobId: string) {
    return this.jobsService.getJob(jobId);
  }

  @Version("1")
  @Post("marketplace/jobs/:jobId/apply")
  applyToMarketplaceJob(@Param("jobId") jobId: string) {
    return this.jobsService.applyToJob(jobId);
  }

  @Version("1")
  @Get("marketplace/filters")
  getMarketplaceFilters() {
    return this.jobsService.getFilters();
  }
}
