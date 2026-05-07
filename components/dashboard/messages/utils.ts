import { ChatRoom, ChatParticipant } from '@/services/chat.service';

/**
 * Determines the correct display name for the "other person" in a chat room.
 *
 * Rules:
 *  - connection rooms → personal name (first_name + last_name)
 *  - direct rooms → HR name > Company name > personal name
 */
export function getDisplayName(
  room: ChatRoom | undefined,
  partner: ChatParticipant | undefined
): string {
  if (!partner) return 'User';

  const personalName =
    `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || 'User';

  if (!room) return personalName;
  if (room.is_group) return room.name || 'Group Chat';

  // Connection-based chats always show personal names
  if (room.room_type === 'connection') {
    return personalName;
  }

  // Direct chats (HR / Bulk messages):
  // Prioritize HR name → Company name → Personal name
  if (room.room_type === 'direct') {
    return (
      partner.profile?.hr_name ||
      partner.profile?.company_name ||
      personalName
    );
  }

  // Fallback for any unknown room_type (including undefined)
  return personalName;
}

/**
 * Returns a subtitle for the chat header (e.g., "Recruiting Manager").
 * Only applies to direct/HR chats where the partner has an hr_designation.
 */
export function getDisplaySubtitle(
  room: ChatRoom | undefined,
  partner: ChatParticipant | undefined
): string | null {
  if (
    room?.room_type === 'direct' &&
    partner?.profile?.hr_designation
  ) {
    return partner.profile.hr_designation;
  }
  return null;
}
