export type AccountType = "adult" | "protected-teen";
export type PersonaRole = "buyer" | "artist" | "parent-preview";
export type Availability = "open" | "limited" | "waitlist" | "closed";
export type ArtworkStyle = "Anime" | "Fantasy" | "Cute" | "Pixel art" | "Comic" | "Realism" | "Watercolor";

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
}

export interface Artwork {
  id: string;
  artistId: string;
  title: string;
  image: string;
  style: ArtworkStyle;
  subject: string;
  price: number;
  likes: number;
  isNew?: boolean;
}

export interface CommissionService {
  id: string;
  artistId: string;
  title: string;
  description: string;
  startingPrice: number;
  turnaround: string;
  revisions: number;
  availability: Availability;
  includes: string[];
}

export interface Review {
  id: string;
  artistId: string;
  author: string;
  rating: number;
  body: string;
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
}

export interface OrderSnapshot {
  id: string;
  buyerId: string;
  artistId: string;
  serviceId: string;
  status: OrderStatus;
  price: number;
  revisionLimit: number;
  revisionsUsed: number;
}

export interface Notification {
  id: string;
  title: string;
  detail: string;
  read: boolean;
}
