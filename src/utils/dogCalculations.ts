import { Dog } from '../types';

interface DogMetrics {
  dailyCalories: number;
  protein: number;
  foodAmount: number;
  feedingSchedule: Array<{ time: string; amount: number }>;
  weeklyAmount: number;
  monthlyAmount: number;
}

export const calculateDogMetrics = (dog: Dog): DogMetrics => {
  // Convert weight to lbs for calculations
  const weightInLbs = dog.weight * 2.20462;
  
  // Base metabolic rate (BMR) calculation using modified Mifflin-St Jeor formula for dogs
  const bmr = 70 * Math.pow(weightInLbs / 2.20462, 0.75);
  
  // Activity factor based on activity level (1-10 scale)
  const activityFactors = {
    low: 1.2, // 1-3
    moderate: 1.4, // 4-6
    high: 1.6, // 7-8
    very_high: 1.8, // 9-10
  };

  let activityFactor = activityFactors.moderate;
  if (dog.activityLevel <= 3) activityFactor = activityFactors.low;
  else if (dog.activityLevel <= 6) activityFactor = activityFactors.moderate;
  else if (dog.activityLevel <= 8) activityFactor = activityFactors.high;
  else activityFactor = activityFactors.very_high;

  // Calculate daily calories
  const dailyCalories = Math.round(bmr * activityFactor);

  // Protein requirements (2.5g per kg of body weight)
  const protein = Math.round(2.5 * dog.weight);

  // Approximate food amount (assuming average kibble has 4 kcal/g)
  const foodAmount = Math.round(dailyCalories / 4);

  // Calculate weekly and monthly amounts
  const weeklyAmount = foodAmount * 7;
  const monthlyAmount = foodAmount * 30;

  // Generate feeding schedule based on age and activity
  let mealCount = 2; // Default to 2 meals for adult dogs
  if (dog.age < 1) mealCount = 3; // Puppies need more frequent meals
  if (weightInLbs < 11) mealCount = 3; // Small dogs might need more frequent meals

  const feedingSchedule = [];
  const mealAmount = Math.round(foodAmount / mealCount);

  if (mealCount === 2) {
    feedingSchedule.push(
      { time: "Morning (8:00 AM)", amount: mealAmount },
      { time: "Evening (6:00 PM)", amount: mealAmount }
    );
  } else {
    feedingSchedule.push(
      { time: "Morning (8:00 AM)", amount: mealAmount },
      { time: "Afternoon (2:00 PM)", amount: mealAmount },
      { time: "Evening (7:00 PM)", amount: mealAmount }
    );
  }

  return {
    dailyCalories,
    protein,
    foodAmount,
    feedingSchedule,
    weeklyAmount,
    monthlyAmount
  };
};