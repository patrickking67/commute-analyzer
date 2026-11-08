export type Place = {
  name: string;
  lat: number;
  lon: number;
};

export type Neighborhood = Place & {
  rent: string;
  safety: string;
  walkability: string;
  nightlife: string;
  amenities: readonly string[];
  zillowUrl: string;
};

export type DayType = 'weekday' | 'weekend';

/** Hour of the day, 0 (midnight) to 23 (11 PM). */
export type Hour = number;
