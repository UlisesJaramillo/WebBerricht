import { Message } from "../entities/Message";

export interface MessageInterface {
  saveMessageDB(message: Message): void;
}
