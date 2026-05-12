import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { Repository } from "typeorm";
import { SessionService } from "../session/session.service";
import { User } from "../entities/user.entity";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly sessionService: SessionService,
    @Inject(REQUEST)
    private readonly request: Request
  ) {}

  async getCurrentUser(): Promise<User> {
    const sessionToken = this.request.cookies?.kudiscore_session as string | undefined;
    const sessionUserId = this.sessionService.getUserId(sessionToken);

    if (sessionUserId) {
      const sessionUser = await this.usersRepository.findOne({ where: { id: sessionUserId } });
      if (sessionUser) {
        return sessionUser;
      }
    }

    const demoUser = await this.usersRepository.findOne({
      where: { phone: "+2348012345678" }
    });

    const user = demoUser ?? await this.usersRepository.findOne({
      where: { role: "trader" },
      order: { createdAt: "DESC" }
    });

    if (user) {
      if (user.phone === "+2348012345678" && (!user.bvn || !user.email || user.email.endsWith("@trace.local"))) {
        user.bvn = user.bvn ?? "22172180083";
        user.email = "amaka.okonkwo@trace.app";
        return this.usersRepository.save(user);
      }

      return user;
    }

    return this.usersRepository.save({
      phone: "+2348012345678",
      fullName: "Amaka Okonkwo",
      email: "amaka.okonkwo@trace.app",
      businessName: "Amaka Foods",
      businessType: "Food & Beverage",
      marketName: "Yaba Main Market",
      role: "trader",
      language: "english",
      bvn: "22172180083",
      bvnLast4: "4321",
      lenderVisible: true
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async create(payload: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(payload);
    return this.usersRepository.save(user);
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async deleteById(id: string): Promise<void> {
    await this.usersRepository.delete({ id });
  }

  async updateCurrentUser(payload: UpdateUserSettingsDto): Promise<User> {
    const user = await this.getCurrentUser();
    Object.assign(user, payload);
    return this.usersRepository.save(user);
  }
}
