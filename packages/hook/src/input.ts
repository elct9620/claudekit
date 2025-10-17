export enum HookEventName {
  Stop = "Stop",
  PostToolUse = "PostToolUse",
}

type SharedInput = {
  hookEventName: HookEventName;
};

export type StopInput = SharedInput & {
  hookEventName: HookEventName.Stop;
  stopHookActive: boolean;
};

export type PostToolUseInput = SharedInput & {
  hookEventName: HookEventName.PostToolUse;
  toolName: string;
  toolInput: {
    [key: string]: any;
  };
  toolResponse: {
    [key: string]: any;
  };
};

export type HookInput = StopInput | PostToolUseInput;
