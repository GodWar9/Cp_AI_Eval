import { PrismaClient } from '@prisma/client';
import { aiService } from './ai.service';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export class ChatService {
  async getConversations(userId: string) {
    return prisma.chatConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        _count: {
          select: { messages: true, attachments: true }
        }
      }
    });
  }

  async getConversation(userId: string, conversationId: string) {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        attachments: true,
      }
    });

    if (!conversation || conversation.userId !== userId) {
      throw new Error('Conversation not found or access denied');
    }

    return conversation;
  }

  async createConversation(userId: string, initialTitle: string = 'New Chat') {
    return prisma.chatConversation.create({
      data: {
        userId,
        title: initialTitle,
      }
    });
  }

  async sendMessage(userId: string, conversationId: string, content: string) {
    // Verify ownership
    const conversation = await this.getConversation(userId, conversationId);

    // Fetch user's CP context for the AI
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cqiScores: { orderBy: { computedAt: 'desc' }, take: 1 },
        submissions: { orderBy: { submittedAt: 'desc' }, take: 10 }
      }
    });

    let contextString = 'User has not linked any CP platforms.';
    if (user) {
      const cqi = user.cqiScores[0]?.score || 0;
      contextString = `Linked Platforms: CF(${user.linkedCodeforcesHandle}), LC(${user.linkedLeetcodeUsername}), AC(${user.linkedAtcoderUsername})
CQI Score: ${Math.round(cqi)}
Recent Submissions:
${user.submissions.map((s: any) => `- [${s.platform}] ${s.problemName}: ${s.verdict} (${s.language})`).join('\n')}`;
    }

    // Include attachments in the context
    let attachmentsContext = '';
    if (conversation.attachments.length > 0) {
      attachmentsContext = '\n\nAttached Files:\n';
      for (const att of conversation.attachments) {
        attachmentsContext += `--- File: ${att.fileName} ---\n${att.extractedContextSummary}\n`;
      }
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'user',
        content,
      }
    });

    // Prepare messages for AI (last 20 messages for context window limit)
    const recentMessages = conversation.messages.slice(-20).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));
    recentMessages.push({ role: 'user', content });

    // Generate AI response
    const aiResponse = await aiService.generateResponse(
      recentMessages, 
      contextString + attachmentsContext
    );

    // Save assistant message
    const savedAiMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: aiResponse || 'Sorry, I could not generate a response.',
      }
    });

    // Update conversation timestamp
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return savedAiMessage;
  }

  async addAttachment(userId: string, conversationId: string, file: Express.Multer.File) {
    await this.getConversation(userId, conversationId); // Verify access

    // Extract content based on file type
    let extractedContextSummary = '';
    try {
      const content = await fs.readFile(file.path, 'utf8');
      
      // Truncate to avoid blowing up the context window
      const MAX_FILE_CHARS = 10000;
      if (content.length > MAX_FILE_CHARS) {
        extractedContextSummary = content.substring(0, MAX_FILE_CHARS) + '\n... [TRUNCATED]';
      } else {
        extractedContextSummary = content;
      }
    } catch (e) {
      console.error('Failed to read file contents', e);
      extractedContextSummary = '[Could not read file contents]';
    }

    const attachment = await prisma.chatAttachment.create({
      data: {
        conversationId,
        fileName: file.originalname,
        fileType: file.mimetype,
        storageUrl: file.filename, // just storing local filename for now
        extractedContextSummary,
      }
    });

    return attachment;
  }
}

export const chatService = new ChatService();
