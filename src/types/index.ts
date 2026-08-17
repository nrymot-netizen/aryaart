export type AccountType = "adult" | "protected-teen";
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

export type OrderStatus = "awaiting-artist" | "accepted" | "payment-required" | "in-progress" | "sketch-review" | "final-review" | "completed";

export interface Notification {
  id: string;
  title: string;
  detail: string;
  read: boolean;
}
