import { sessionRepository } from "@/repositories/session.repository";
import { generateSessionToken, hashSessionToken } from "@/lib/utils/session";
import { AUTH_CONSTANTS } from "@/constants/auth.constant";

export const sessionService = {
  async create(userId: number) {
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + AUTH_CONSTANTS.SESSION_DURATION_MS);

    await sessionRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });

    return { token, expiresAt };
  },

  async validate(token: string) {
    const tokenHash = hashSessionToken(token);
    const session = await sessionRepository.findByTokenHash(tokenHash);

    if (!session) return null;

    if (session.expiresAt <= new Date() || !session.user?.isActive) {
      await sessionRepository.deleteByTokenHash(tokenHash);
      return null;
    }

    return session;
  },

  async delete(token: string) {
    const tokenHash = hashSessionToken(token);
    await sessionRepository.deleteByTokenHash(tokenHash);
  },

  async deleteOtherSessions(userId: number, currentToken: string) {
    const currentTokenHash = hashSessionToken(currentToken);
    return sessionRepository.deleteOtherSessions(userId, currentTokenHash);
  },
};