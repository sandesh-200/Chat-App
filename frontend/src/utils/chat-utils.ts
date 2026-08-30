// src/lib/chat-utils.ts

/**
 * Extracts initials from a full name (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name?: string): string => {
    if (!name || name === "Unknown User") return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

/**
 * Formats message date strings into readable contextual boundaries (Today, Yesterday, Date)
 */
export const getDateSeparatorLabel = (timeStr?: string): string | null => {
    if (!timeStr) return null;
    const parsedDate = new Date(timeStr);
    if (isNaN(parsedDate.getTime())) return null;

    const now = new Date();
    const isToday = parsedDate.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = parsedDate.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return parsedDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: parsedDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
};

/**
 * Checks if two message timestamps exceed the grouping threshold (5 minutes)
 */
export const isTimeGapSignificant = (prevTime?: string, currTime?: string): boolean => {
    if (!prevTime || !currTime) return false;
    const prev = new Date(prevTime).getTime();
    const curr = new Date(currTime).getTime();
    if (isNaN(prev) || isNaN(curr)) return false;
    return curr - prev > 5 * 60 * 1000;
};

/**
 * Checks if a string contains ONLY emojis (and optional whitespace), 
 * and returns the emoji count. Safely handles complex emojis (👩‍👩‍👧‍👦, 🇳🇵).
 */
export const getEmojiOnlyDetails = (text: string): { isEmojiOnly: boolean; count: number } => {
    const trimmed = text.trim();
    if (!trimmed) return { isEmojiOnly: false, count: 0 };

    // Regex matching extended emoji sets, symbols, and pictographs
    const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Component}|\s)+$/u;

    if (!emojiRegex.test(trimmed)) {
        return { isEmojiOnly: false, count: 0 };
    }

    // Count the number of individual emojis using Intl.Segmenter
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const count = [...segmenter.segment(trimmed)].filter(
        (s) => s.segment.trim().length > 0
    ).length;

    // We usually only apply jumbo size if there are 1 to 3 emojis
    return { isEmojiOnly: count > 0 && count <= 3, count };
};