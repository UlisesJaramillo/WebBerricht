export interface MessageApi {
  sendSmsBlock(messages: string): Promise<boolean>;
}
