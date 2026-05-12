import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async getCurrentUser(): Promise<User> {
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

  async deleteById(id: string): Promise<void> {
    await this.usersRepository.delete({ id });
  }

  async updateCurrentUser(payload: UpdateUserSettingsDto): Promise<User> {
    const user = await this.getCurrentUser();
    Object.assign(user, payload);
    return this.usersRepository.save(user);
  }
}
