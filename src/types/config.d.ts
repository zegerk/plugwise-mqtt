export interface actionTopic {
  listen: string;
  status: string;
  message?: string;
  encoding?: string;
}

export interface topicTemplate {
  topic: string;
  message: string;
  encoding?: string;
}

export interface statusTopic {
  topic: string;
  encoding?: string;
}

export interface actionGroup {
  [thermostat?: string]: actionTopic;
  [scene?: string]: actionTopic;
}

export interface config {
  plugwiseUpdate: boolean;
  logLevel: string;
  plugwise: {
    baseUrl: string;
    username: string;
    password: string;
    pullPause: number;
  }
  mqtt : {
    dryRun: boolean;
    server: string;
    port: number;
    topics: {
      status?: {
        [index: string]: statusTopic
      },
      data?: {
        [index: string]: topicTemplate
      },
      action?: {
        [index: string]: actionGroup
      }
    }
  }
}
