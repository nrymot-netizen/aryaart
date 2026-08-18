export type AccountType = "adult" | "protected-teen";
export type PersonaRole = "buyer" | "artist" | "parent-preview";
export type Availability = "open" | "limited" | "waitlist" | "closed";
export type ArtworkStyle =
  | "Anime"
  | "Cartoon"
  | "Realism"
  | "Semi-realism"
  | "Pixel art"
  | "Watercolor"
  | "Manga"
  | "Comic"
  | "Fantasy"
  | "Minimalist"
  | "Cute"
  | "Gothic";
export type ArtworkSubject =
  | "character"
  | "portrait"
  | "pet"
  | "landscape"
  | "environment"
  | "fan art"
  | "original character"
  | "emote/avatar";
export type PostType = "finished" | "sketch" | "process" | "timelapse" | "commission-example";
export type IntendedUse = "personal" | "commercial";
export type ArtworkFormat = "digital" | "physical";
export type WaitlistStatus = "active" | "left" | "promoted";
export type ArtistProfileTab = "portfolio" | "posts" | "commissions" | "reviews" | "about";

export interface ArtistRules {
  acceptedSubjects: string[];
  declinedSubjects: string[];
  revisionPolicy: string;
  usageRights: string;
  communicationBoundary: string;
  expectedResponseTime: string;
  cancellationPolicy: string;
}

export interface Artist {
  id: string;
  username: string;
  displayName: string;
  specialty: string;
  bio: string;
  avatar: string;
  accountType: AccountType;
  styles: ArtworkStyle[];
  availability: Availability;
  slots?: number;
  startingPrice: number;
  rating: number;
  completedCommissions: number;
  responseTime: string;
  emerging: boolean;
  exposureRank: number;
  rules: ArtistRules;
}

export interface Artwork {
  id: string;
  artistId: string;
  title: string;
  description: string;
  image: string;
  style: ArtworkStyle;
  subject: ArtworkSubject;
  tags: string[];
  tools: string[];
  aiDisclosure: boolean;
  visibility: "public" | "unlisted";
  publishedAt: string;
  price: number;
  likes: number;
  isNew?: boolean;
  format: ArtworkFormat;
}

export interface Post {
  id: string;
  artistId: string;
  artworkId?: string;
  postType: PostType;
  body: string;
  publishedAt: string;
}

export interface CommissionService {
  id: string;
  artistId: string;
  title: string;
  description: string;
  startingPrice: number;
  turnaround: string;
  turnaroundDays: number;
  revisions: number;
  availability: Availability;
  includes: string[];
  exclusions: string[];
  deliverables: string[];
  usageOptions: IntendedUse[];
  addOns: ServiceAddOn[];
  exampleArtworkIds: string[];
  remainingSlots?: number;
  extraCharacterPrice?: number;
  commercialSurcharge?: number;
}

export interface Review {
  id: string;
  artistId: string;
  author: string;
  rating: number;
  body: string;
  serviceTitle: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  artistId: string;
  serviceId: string;
  buyerId: string;
  position: number;
  status: WaitlistStatus;
  promotedAt?: string;
  expiresAt?: string;
}

export type OrderStatus = "draft" | "awaiting-artist" | "counteroffer" | "payment-required" | "in-progress" | "sketch-review" | "final-review" | "completed" | "declined" | "cancelled";
export type OrderAction = "submit-request" | "accept-request" | "counter-request" | "decline-request" | "accept-counter" | "reject-counter" | "complete-checkout" | "submit-sketch" | "approve-sketch" | "request-revision" | "submit-final" | "accept-delivery" | "cancel";

export interface DemoPersona {
  id: string;
  label: string;
  role: PersonaRole;
  accountType: AccountType;
  artistId?: string;
  description: string;
}

export interface ServiceAddOn {
  id: string;
  name: string;
  price: number;
}

export interface PriceSelection {
  characterCount: number;
  extraCharacterPrice: number;
  selectedAddOns: ServiceAddOn[];
  commercialSurcharge?: number;
  intendedUse?: IntendedUse;
}

export interface DemoFile {
  id: string;
  orderId?: string;
  name: string;
  type: string;
  size: number;
  kind: "reference" | "sketch" | "final";
  preview?: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  orderId: string;
  actorId: string;
  eventType: string;
  detail: string;
  createdAt: string;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  senderId: string;
  body: string;
  kind: "user" | "system";
  moderationState: "ok" | "blocked";
  createdAt: string;
}

export interface Milestone {
  id: string;
  orderId: string;
  type: string;
  status: "pending" | "current" | "complete";
  completedAt?: string;
}

export interface LedgerEntry {
  id: string;
  artistId: string;
  orderId: string;
  entryType: "pending" | "available";
  amount: number;
  createdAt: string;
}

export interface ParentApproval {
  id: string;
  teenPersonaId: string;
  action: "checkout" | "commercial-terms" | "payout" | "submit-request";
  orderId?: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  createdAt: string;
  payload?: Record<string, string | number | boolean>;
}

export interface RequestDraft {
  serviceId: string;
  buyerId: string;
  brief: string;
  characterCount: number;
  intendedUse: IntendedUse;
  addOnIds: string[];
  deadline: string;
  budget: number;
  notes: string;
  rulesAccepted: boolean;
  references: DemoFile[];
  step: number;
}

export interface CommissionOrder {
  id: string;
  buyerId: string;
  artistId: string;
  serviceId: string;
  status: OrderStatus;
  brief: string;
  characterCount: number;
  intendedUse: IntendedUse;
  addOnIds: string[];
  deadline: string;
  budget: number;
  notes?: string;
  references: DemoFile[];
  estimatedPrice: number;
  price: number;
  revisionLimit: number;
  revisionsUsed: number;
  counter?: { price: number; deadline: string; revisions: number; notes: string; reason: string };
  decline?: { reason: string; note?: string };
  termsSnapshot?: {
    serviceTitle: string;
    price: number;
    deadline: string;
    revisions: number;
    intendedUse: IntendedUse;
    addOnIds: string[];
  };
  parentApprovalRequired: boolean;
  parentApproved: boolean;
  review?: { rating: number; body: string; createdAt: string };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  profileId: string;
  title: string;
  detail: string;
  href: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface DiscoveryFilters {
  q: string;
  styles: ArtworkStyle[];
  subjects: ArtworkSubject[];
  maxBudget?: number;
  availability: Availability[];
  maxTurnaroundDays?: number;
  usage?: IntendedUse;
  format?: ArtworkFormat;
  emerging?: boolean;
}
