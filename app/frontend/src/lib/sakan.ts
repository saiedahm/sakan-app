import { useEffect, useState } from 'react';
import { client } from './api';

/** Sakan API layer — every backend call goes through @metagptx/web-sdk. */

export const SAKAN_BUCKET = 'sakan-media';

export interface ProfileBrief {
  user_id: string;
  username: string | null;
  display_name: string;
  gender: string;
  age: number | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  primary_language: string | null;
  marital_status: string | null;
  avatar_object_key: string | null;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string | null;
}

export interface FullProfile extends ProfileBrief {
  birth_date: string | null;
  onboarding_completed: boolean;
  is_favorite: boolean;
  is_self: boolean;
  photo_object_keys: string[];
}

export interface Preferences {
  preferred_gender: string | null;
  min_age: number | null;
  max_age: number | null;
  preferred_country: string | null;
}

export interface MeState {
  user_id: string;
  email: string;
  name: string | null;
  profile: ProfileBrief | null;
  preferences: Preferences | null;
  is_premium: boolean;
  is_featured?: boolean;
  premium_until: string | null;
  unread_total: number;
  messages_sent: number;
  free_message_limit: number;
}

export interface Conversation {
  id: number;
  counterpart_user_id: string;
  counterpart_display_name: string;
  counterpart_avatar_object_key: string | null;
  counterpart_is_verified: boolean;
  last_message_text: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_user_id: string;
  content: string;
  is_read: boolean;
  is_mine: boolean;
  created_at: string | null;
}

export interface VisitedProfile extends ProfileBrief {
  visited_at: string | null;
}

export interface Plan {
  id: number;
  code: string;
  name: string;
  tagline: string | null;
  price_cents: number;
  currency: string;
  duration_days: number;
  features: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface BlockEntry {
  user_id: string;
  display_name: string;
  avatar_object_key: string | null;
  blocked_at: string | null;
}

export interface AdSlot {
  id: number;
  title: string;
  subtitle: string | null;
  image_object_key: string | null;
  link_url: string | null;
  position: number;
}

export interface HomePayload {
  ads: AdSlot[];
  featured: ProfileBrief[];
  latest: ProfileBrief[];
}

/** Extract a human-readable message from a web-sdk API error. */
export const errDetail = (e: unknown): string => {
  const err = e as { data?: { detail?: string }; response?: { data?: { detail?: string } }; message?: string };
  return err?.data?.detail || err?.response?.data?.detail || err?.message || 'Something went wrong';
};

export interface ProfileInput {
  username?: string | null;
  display_name?: string;
  gender?: string;
  birth_date?: string;
  country?: string | null;
  city?: string | null;
  bio?: string | null;
  primary_language?: string | null;
  marital_status?: string | null;
  avatar_object_key?: string | null;
  onboarding_completed?: boolean;
}

export interface PreferencesInput {
  preferred_gender?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  preferred_country?: string | null;
}

const compact = (params: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export const sakanApi = {
  me: async (): Promise<MeState> =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/me', method: 'GET' })).data,

  publicHome: async (): Promise<HomePayload> =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/public/home', method: 'GET' })).data,

  presence: async (): Promise<{ ok: boolean }> =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/presence', method: 'POST', data: {} })).data,

  discover: async (params: { gender?: string; country?: string; city?: string; min_age?: number; max_age?: number; q?: string; mode?: string; skip?: number; limit?: number }) =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/discover', method: 'GET', data: compact(params) })).data as {
      items: ProfileBrief[];
      total: number;
      skip: number;
      limit: number;
    },

  publicProfile: async (userId: string): Promise<FullProfile> =>
    (await client.apiCall.invoke({ url: `/api/v1/sakan/profiles/${userId}`, method: 'GET' })).data,

  recordVisit: async (userId: string) =>
    (await client.apiCall.invoke({ url: `/api/v1/sakan/profiles/${userId}/visit`, method: 'POST', data: {} })).data,

  saveProfile: async (data: ProfileInput) =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/me/profile', method: 'PUT', data })).data,

  savePreferences: async (data: PreferencesInput) =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/me/preferences', method: 'PUT', data })).data,

  favorites: async (): Promise<{ items: ProfileBrief[]; total: number }> =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/favorites', method: 'GET' })).data,

  addFavorite: async (userId: string) =>
    (await client.apiCall.invoke({ url: `/api/v1/sakan/favorites/${userId}`, method: 'POST', data: {} })).data,

  removeFavorite: async (userId: string) =>
    (await client.apiCall.invoke({ url: `/api/v1/sakan/favorites/${userId}`, method: 'DELETE' })).data,

  visits: async (): Promise<{ items: VisitedProfile[]; total: number }> =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/visits', method: 'GET' })).data,

  blocks: async (): Promise<{ items: BlockEntry[]; total: number }> =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/blocks', method: 'GET' })).data,

  block: async (userId: string) =>
    (await client.apiCall.invoke({ url: `/api/v1/sakan/blocks/${userId}`, method: 'POST', data: {} })).data,

  unblock: async (userId: string) =>
    (await client.apiCall.invoke({ url: `/api/v1/sakan/blocks/${userId}`, method: 'DELETE' })).data,

  report: async (data: { reported_user_id: string; reason: string; details?: string }) =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/reports', method: 'POST', data })).data,

  conversations: async (): Promise<{ items: Conversation[]; total: number }> =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/conversations', method: 'GET' })).data,

  startConversation: async (peerUserId: string): Promise<Conversation> =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/conversations', method: 'POST', data: { peer_user_id: peerUserId } })).data,

  messages: async (conversationId: number): Promise<{ items: ChatMessage[]; conversation_id: number }> =>
    (await client.apiCall.invoke({ url: `/api/v1/sakan/conversations/${conversationId}/messages`, method: 'GET' })).data,

  sendMessage: async (conversationId: number, content: string): Promise<ChatMessage> =>
    (await client.apiCall.invoke({ url: `/api/v1/sakan/conversations/${conversationId}/messages`, method: 'POST', data: { content } })).data,

  addMedia: async (objectKey: string, isPrimary: boolean) =>
    (await client.apiCall.invoke({ url: '/api/v1/sakan/me/media', method: 'POST', data: { object_key: objectKey, is_primary: isPrimary } })).data,

  removeMedia: async (photoId: number) =>
    (await client.apiCall.invoke({ url: `/api/v1/sakan/me/media/${photoId}`, method: 'DELETE' })).data,

  createCheckout: async (planCode: string, urls?: { success_url?: string; cancel_url?: string }) =>
    (
      await client.apiCall.invoke({
        url: '/api/v1/sakan/payments/create_payment_session',
        method: 'POST',
        data: {
          plan_code: planCode,
          success_url: urls?.success_url ?? `${window.location.origin}/subscription`,
          cancel_url: urls?.cancel_url ?? `${window.location.origin}/subscription`,
        },
      })
    ).data as { session_id: string; url: string | null },

  verifyPayment: async (sessionId: string) =>
    (
      await client.apiCall.invoke({
        url: '/api/v1/sakan/payments/verify_payment',
        method: 'POST',
        data: { session_id: sessionId },
      })
    ).data as { status: string; payment_id: number | null; plan_code: string | null; premium_until: string | null },
};

/** Resolve a stored object_key into a preview URL (cached). */
const mediaCache = new Map<string, string>();

export async function getMediaUrl(objectKey?: string | null): Promise<string | null> {
  if (!objectKey) return null;
  const cached = mediaCache.get(objectKey);
  if (cached) return cached;
  try {
    const res = await client.storage.getDownloadUrl({ bucket_name: SAKAN_BUCKET, object_key: objectKey });
    const url: string | undefined = res?.data?.download_url;
    if (url) mediaCache.set(objectKey, url);
    return url ?? null;
  } catch {
    return null;
  }
}

/** Resolve many object keys, keeping input order. */
export async function getMediaUrls(objectKeys: string[]): Promise<Record<string, string>> {
  const entries = await Promise.all(
    objectKeys.map(async (key) => [key, await getMediaUrl(key)] as const),
  );
  return Object.fromEntries(entries.filter(([, url]) => Boolean(url)) as Array<[string, string]>);
}

/** 3-state auth: loading | authenticated | anonymous. Never assume anonymous while pending. */
export function useAuthState(): 'loading' | 'authed' | 'anon' {
  const [state, setState] = useState<'loading' | 'authed' | 'anon'>('loading');
  useEffect(() => {
    let active = true;
    client
      .auth
      .me()
      .then((res: { data?: unknown }) => {
        if (active) setState(res?.data ? 'authed' : 'anon');
      })
      .catch(() => {
        if (active) setState('anon');
      });
    return () => {
      active = false;
    };
  }, []);
  return state;
}

export function parsePlanFeatures(plan: Plan): string[] {
  if (!plan.features) return [];
  try {
    const parsed = JSON.parse(plan.features);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function formatPrice(cents: number, currency: string): string {
  if (!cents) return 'Free';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(0)}`;
  }
}
