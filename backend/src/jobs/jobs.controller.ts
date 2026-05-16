import { Body, Controller, Get, Param, Post, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { CreateJobDto } from "./dto/create-job.dto";
import { JobsService } from "./jobs.service";
import { resolveToken } from "../session/resolve-token";

@Controller()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Version("1")
  @Get("jobs/mine")
  getMyJobs(@Req() req: Request) {
    return this.jobsService.getMyJobs(resolveToken(req));
  }

  @Version("1")
  @Post("jobs")
  createJob(@Req() req: Request, @Body() dto: CreateJobDto) {
    return this.jobsService.createJob(resolveToken(req), dto);
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
  getMyApplications(@Req() req: Request) {
    return this.jobsService.getMyApplications(resolveToken(req));
  }

  @Version("1")
  @Get("marketplace/jobs")
  getMarketplaceJobs(@Req() req: Request) {
    return this.jobsService.getMarketplaceJobs(resolveToken(req));
  }

  @Version("1")
  @Get("marketplace/jobs/:jobId")
  getMarketplaceJob(@Param("jobId") jobId: string) {
    return this.jobsService.getJob(jobId);
  }

  @Version("1")
  @Post("marketplace/jobs/:jobId/apply")
  applyToMarketplaceJob(@Req() req: Request, @Param("jobId") jobId: string, @Body() body: { coverNote?: string }) {
    return this.jobsService.applyToJob(resolveToken(req), jobId, body?.coverNote);
  }

  @Version("1")
  @Get("marketplace/filters")
  getMarketplaceFilters() {
    return this.jobsService.getFilters();
  }
}
