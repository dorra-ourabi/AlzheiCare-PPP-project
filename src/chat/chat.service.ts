import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';

interface CreateMessageInput {
  threadUserId: number;
  senderId: number;
  senderRole: string;
  content: string;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
  ) {}

  async createMessage(input: CreateMessageInput): Promise<ChatMessage> {
    const message = this.messageRepository.create({
      threadUserId: input.threadUserId,
      senderId: input.senderId,
      senderRole: input.senderRole,
      content: input.content,
    });

    return this.messageRepository.save(message);
  }
}
