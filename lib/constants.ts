/** Chat model options shown in the chatbot model selector. */
type ChatModelOption = {
    id: string;
    label: string;
};

export const CHAT_MODEL_OPTIONS: ChatModelOption[] = [
    {
        id: "nvidia/nemotron-3-nano-30b-a3b:free",
        label: "Nemotron 3 Nano (Free)",
    },
    {
        id: "arcee-ai/trinity-large-preview:free",
        label: "Trinity Large Preview (Free)",
    },
];

/** Model used for mock interview sessions via OpenRouter. */
export const MOCK_INTERVIEW_MODEL_ID =
    "nvidia/nemotron-3-nano-30b-a3b:free";
