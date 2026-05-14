import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Session } from "../entities/session.entity";

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>
  ) {}

  async createSession(token: string, userId: string) {
    await this.sessionRepository.save({ token, userId });
  }

  async getUserId(token?: string | null): Promise<string | null> {
    if (!token) return null;
    const session = await this.sessionRepository.findOne({ where: { token } });
    return session?.userId ?? null;
  }

  async clearSession(token?: string | null) {
    if (!token) return;
    await this.sessionRepository.delete({ token });
  }
}
