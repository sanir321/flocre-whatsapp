export type Settings = {
  id?: string;
  rejectCall: boolean;
  msgCall?: string;
  groupsIgnore: boolean;
  alwaysOnline: boolean;
  readMessages: boolean;
  readStatus: boolean;
  syncFullHistory: boolean;
  createdAt?: string;
  updatedAt?: string;
  instanceId?: string;
};

export type NewInstance = {
  instanceName: string;
  qrcode?: boolean;
  integration: string;
  token?: string | null;
  number?: string | null;
  businessId?: string | null;
};

export type Instance = {
  id: string;
  name: string;
  connectionStatus: string;
  ownerJid: string;
  profileName: string;
  profilePicUrl: string;
  integration: string;
  number: string;
  businessId: string;
  token: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  Setting: Settings;
  _count?: {
    Message?: number;
    Contact?: number;
    Chat?: number;
  };
};

export type Contact = {
  id: string;
  pushName: string;
  remoteJid: string;
  profilePicUrl: string;
  createdAt: string;
  updatedAt: string;
  instanceId: string;
};

export type Chat = {
  id: string;
  pushName: string;
  remoteJid: string;
  labels: string[] | null;
  profilePicUrl: string;
  createdAt: string;
  updatedAt: string;
  instanceId: string;
};

export type Key = {
  id: string;
  fromMe: boolean;
  remoteJid: string;
};

export type Message = {
  id: string;
  key: Key;
  pushName: string;
  messageType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  messageTimestamp: string;
  instanceId: string;
  source: string;
};

export type SendText = {
  number: string;
  text: string;
  options?: {
    delay?: number;
    presence?: string;
    linkPreview?: boolean;
  };
};

export type SendMedia = {
  number: string;
  mediaMessage: {
    mediatype: "image" | "video" | "audio" | "document";
    mimetype: string;
    caption?: string;
    media: string; // Base64 string
    fileName?: string;
  };
  options?: {
    delay?: number;
    presence?: string;
  };
};

export type SendAudio = {
  number: string;
  audioMessage: {
    audio: string; // Base64 string
  };
  options?: {
    delay?: number;
    presence?: string;
  };
};

export type IntegrationSession = {
  id?: string;
  remoteJid: string;
  pushName: string;
  sessionId: string;
  status: string;
  awaitUser: boolean;
  createdAt: string;
  updatedAt: string;
  botId: string;
};







export type Evoai = {
  id?: string;
  enabled: boolean;
  description: string;
  agentUrl: string;
  apiKey: string;
  triggerType: string;
  triggerOperator: string;
  triggerValue: string;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  ignoreJids?: string[];
  splitMessages?: boolean;
  timePerChar?: number;
};

export type EvoaiSettings = {
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  evoaiIdFallback?: string;
  ignoreJids?: string[];
  splitMessages?: boolean;
  timePerChar?: number;
};



export type Webhook = {
  id?: string;
  enabled: boolean;
  url: string;
  events: string[];
  base64: boolean;
  byEvents: boolean;
};

export type Websocket = {
  id?: string;
  enabled: boolean;
  events: string[];
};

export type Rabbitmq = {
  id?: string;
  enabled: boolean;
  events: string[];
};

export type Sqs = {
  id?: string;
  enabled: boolean;
  events: string[];
};

export type Proxy = {
  id?: string;
  enabled: boolean;
  host: string;
  port: string;
  protocol: string;
  username?: string;
  password?: string;
};



export type EvolutionBot = {
  id?: string;
  enabled: boolean;
  description: string;
  apiUrl: string;
  apiKey?: string;
  triggerType: string;
  triggerOperator: string;
  triggerValue: string;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  ignoreJids?: string[];
  splitMessages?: boolean;
  timePerChar?: number;
};

export type EvolutionBotSettings = {
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  botIdFallback?: string;
  ignoreJids?: string[];
  splitMessages?: boolean;
  timePerChar?: number;
};


