import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SessionService } from "../session/session.service";
import { User } from "../entities/user.entity";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly sessionService: SessionService
  ) {}

  async getCurrentUser(sessionToken?: string): Promise<User> {
    const sessionUserId = await this.sessionService.getUserId(sessionToken);

    if (!sessionUserId) {
      throw new UnauthorizedException("No active session. Please log in.");
    }

    const sessionUser = await this.usersRepository.findOne({ where: { id: sessionUserId } });
    if (!sessionUser) {
      throw new UnauthorizedException("Session user not found. Please log in again.");
    }

    return sessionUser;
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

  async findByPhone(phone: string, includePasswordHash = false): Promise<User | null> {
    if (includePasswordHash) {
      return this.usersRepository
        .createQueryBuilder("user")
        .addSelect("user.passwordHash")
        .where("user.phone = :phone", { phone })
        .getOne();
    }

    return this.usersRepository.findOne({ where: { phone } });
  }

  async findByEmail(email: string, includePasswordHash = false): Promise<User | null> {
    if (includePasswordHash) {
      return this.usersRepository
        .createQueryBuilder("user")
        .addSelect("user.passwordHash")
        .where("user.email = :email", { email })
        .getOne();
    }

    return this.usersRepository.findOne({ where: { email } });
  }

  /** Loads user with BVN included — only used for virtual account provisioning. */
  async findWithBvn(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder("user")
      .addSelect("user.bvn")
      .where("user.id = :id", { id })
      .getOne();
  }

  /** Only used by AuthService — explicitly loads the password hash column. */
  async findForAuth(identifier: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.email = :id", { id: identifier })
      .getOne();
  }

  async deleteById(id: string): Promise<void> {
    await this.usersRepository.delete({ id });
  }

  async updateCurrentUser(sessionToken: string | undefined, payload: UpdateUserSettingsDto): Promise<User> {
    const user = await this.getCurrentUser(sessionToken);
    Object.assign(user, payload);
    return this.usersRepository.save(user);
  }
}
