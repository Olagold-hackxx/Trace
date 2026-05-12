import { Injectable } from "@nestjs/common";

@Injectable()
export class SessionService {
  private readonly sessions = new Map<string, string>();

  createSession(token: string, userId: string) {
    this.sessions.set(token, userId);
  }

  getUserId(token?: string | null) {
    if (!token) {
      return null;
    }

    return this.sessions.get(token) ?? null;
  }

  clearSession(token?: string | null) {
    if (!token) {
      return;
    }

    this.sessions.delete(token);
  }
}
