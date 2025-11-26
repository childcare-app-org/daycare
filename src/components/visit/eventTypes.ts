export type EventCategory = "Output" | "Input" | "State" | "Other";

export enum EventType {
  Pee = "Pee",
  Poo = "Poo",
  Puke = "Puke",
  Eat = "Eat",
  Drink = "Drink",
  Medication = "Medication",
  Slept = "Slept",
  WokeUp = "Woke-up",
  Temperature = "Temperature",
  Note = "Note",
}

export type EventDefinition = {
  label: EventType;
  category: EventCategory;
  icon: string;
  tags?: string[];
};

export const EVENT_TYPES: EventDefinition[] = [
  {
    label: EventType.Pee,
    category: "Output",
    icon: "💧",
    tags: ["clear", "yellow", "dark yellow"],
  },
  {
    label: EventType.Poo,
    category: "Output",
    icon: "💩",
    tags: ["normal", "diarrhea", "constipation", "blood present"],
  },
  {
    label: EventType.Puke,
    category: "Output",
    icon: "🤢",
    tags: ["after meal", "projectile", "with fever"],
  },
  {
    label: EventType.Eat,
    category: "Input",
    icon: "🍽️",
    tags: ["bottle", "spoon-fed", "self-fed", "full portion", "partial"],
  },
  {
    label: EventType.Drink,
    category: "Input",
    icon: "🥤",
    tags: ["water", "milk", "juice", "full portion", "partial"],
  },
  {
    label: EventType.Medication,
    category: "Input",
    icon: "💊",
    tags: ["fever reducer", "pain relief", "antibiotic", "inhaler"],
  },
  {
    label: EventType.Slept,
    category: "State",
    icon: "😴",
    tags: ["restful", "restless", "short nap", "long nap"],
  },
  {
    label: EventType.WokeUp,
    category: "State",
    icon: "🌅",
    tags: ["happy", "cranky"],
  },
  { label: EventType.Temperature, category: "Other", icon: "🌡️" },
  { label: EventType.Note, category: "Other", icon: "📝" },
];

// Helper function to get emoji for an event type
export const getEventEmoji = (eventType: EventType | string): string => {
  const event = EVENT_TYPES.find(
    (e) => e.label === eventType || e.label === (eventType as string),
  );
  return event?.icon || "✓";
};

// Helper function to get tags for an event type
export const getEventTags = (eventType: EventType | string): string[] => {
  // Handle variations like "Woke-up" vs "Woke up"
  const normalizedType = String(eventType).replace(/\s+/g, "-");
  const event = EVENT_TYPES.find(
    (e) =>
      e.label === eventType ||
      e.label.toLowerCase() === String(eventType).toLowerCase() ||
      e.label.toLowerCase() === normalizedType.toLowerCase(),
  );
  return event?.tags || [];
};

// Helper function to check if a string is a valid event type
export const isValidEventType = (value: string): value is EventType => {
  return Object.values(EventType).includes(value as EventType);
};
