import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JobApplication } from "../entities/job-application.entity";
import { Job } from "../entities/job.entity";
import { UsersService } from "../users/users.service";
import { CreateJobDto } from "./dto/create-job.dto";

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(JobApplication)
    private readonly applicationsRepository: Repository<JobApplication>,
    private readonly usersService: UsersService
  ) {}

  async getMyJobs() {
    const user = await this.usersService.getCurrentUser();
    const existing = await this.jobsRepository.find({
      where: { postedByUserId: user.id },
      order: { createdAt: "DESC" }
    });

    if (existing.length > 0) {
      return existing;
    }

    await this.jobsRepository.save({
      postedByUserId: user.id,
      title: "Sales Assistant",
      category: "Sales",
      payKobo: "850000",
      durationLabel: "3 days",
      location: "Yaba Main Market",
      description: "Help manage sales at our food stall.",
      status: "active"
    });

    return this.jobsRepository.find({
      where: { postedByUserId: user.id },
      order: { createdAt: "DESC" }
    });
  }

  async createJob(dto: CreateJobDto) {
    const user = await this.usersService.getCurrentUser();
    return this.jobsRepository.save({
      postedByUserId: user.id,
      ...dto,
      status: "active"
    });
  }

  async getJob(jobId: string) {
    const job = await this.jobsRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException("Job not found");
    }

    return job;
  }

  async getJobApplications(jobId: string) {
    return this.applicationsRepository.find({
      where: { jobId },
      order: { createdAt: "DESC" }
    });
  }

  async getMyApplications() {
    const user = await this.usersService.getCurrentUser();
    return this.applicationsRepository.find({
      where: { userId: user.id },
      order: { createdAt: "DESC" }
    });
  }

  async getMarketplaceJobs() {
    const jobs = await this.jobsRepository.find({
      where: { status: "active" },
      order: { createdAt: "DESC" }
    });

    if (jobs.length > 0) {
      return jobs;
    }

    const user = await this.usersService.getCurrentUser();
    await this.jobsRepository.save([
      {
        postedByUserId: user.id,
        title: "Sales Assistant",
        category: "Sales",
        payKobo: "850000",
        durationLabel: "3 days",
        location: "Yaba, Lagos",
        description: "Help manage market stall sales and customer orders.",
        status: "active"
      },
      {
        postedByUserId: user.id,
        title: "Delivery Rider",
        category: "Delivery",
        payKobo: "600000",
        durationLabel: "1 day",
        location: "Surulere, Lagos",
        description: "Handle same-day customer deliveries across Surulere.",
        status: "active"
      }
    ]);

    return this.jobsRepository.find({
      where: { status: "active" },
      order: { createdAt: "DESC" }
    });
  }

  async applyToJob(jobId: string) {
    await this.getJob(jobId);
    const user = await this.usersService.getCurrentUser();
    return this.applicationsRepository.save({
      jobId,
      userId: user.id,
      status: "pending"
    });
  }

  getFilters() {
    return {
      categories: ["Sales", "Delivery", "Catering", "Supervision", "Admin", "Cleaning", "Security"],
      locations: ["Yaba", "Surulere", "Lekki", "Ikeja", "Victoria Island", "Oshodi"]
    };
  }
}
