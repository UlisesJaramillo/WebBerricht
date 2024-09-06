export interface MessageIA {
  analizeMessage(message: string): Promise<string>;
}
