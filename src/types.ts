export interface BreedCharacteristics {
  min_height_cm: number;
  max_height_cm: number;
  min_weight_kg: number;
  max_weight_kg: number;
  life_expectancy_years: number;
  energy_level: number;
  grooming_needs: number;
  shedding_level: number;
  trainability: number;
  barking_level: number;
  good_with_children: boolean;
  good_with_other_dogs: boolean;
  good_with_strangers: boolean;
  exercise_needs_minutes: number;
  health_issues: string[];
}

export interface DogBreed {
  id: string;
  name: string;
  description: string;
  has_size_variations: boolean;
  size_variations: BreedSizeVariation[];
}

export interface BreedSizeVariation {
  id?: string;
  breed_id?: string;
  size_category: 'toy' | 'mini' | 'small' | 'medium' | 'standard' | 'large' | 'giant';
  size_description: string;
  dietary_needs: string;
  health_issues: string[];
  care_instructions: string;
  special_considerations: string;
  shared_characteristics: boolean;
  male_characteristics: BreedCharacteristics;
  female_characteristics: BreedCharacteristics;
}