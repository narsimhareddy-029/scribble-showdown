export const wordCategories = {
  Animals: [
    'Dog', 'Cat', 'Elephant', 'Lion', 'Tiger', 'Giraffe', 'Monkey', 'Panda', 'Kangaroo',
    'Penguin', 'Dolphin', 'Shark', 'Octopus', 'Butterfly', 'Bee', 'Owl', 'Eagle', 'Snake',
    'Frog', 'Turtle', 'Rabbit', 'Squirrel', 'Fox', 'Wolf', 'Bear', 'Deer', 'Horse', 'Cow'
  ],
  Movies: [
    'Inception', 'Avatar', 'Titanic', 'Gladiator', 'Jaws', 'Matrix', 'Star Wars', 'Toy Story',
    'Iron Man', 'Frozen', 'Shrek', 'Batman', 'Spider-Man', 'Jurassic Park', 'Lion King', 'Harry Potter',
    'Finding Nemo', 'Up', 'The Avengers', 'Interstellar', 'Joker', 'Home Alone', 'Coco', 'Aladdin'
  ],
  Food: [
    'Pizza', 'Sushi', 'Burger', 'Pasta', 'Taco', 'Salad', 'Ice Cream', 'Pancake', 'Waffle',
    'Sandwich', 'Hot Dog', 'Donut', 'Cookie', 'Cake', 'Chocolate', 'Apple', 'Banana', 'Strawberry',
    'Watermelon', 'Cheese', 'Egg', 'Bread', 'Soup', 'Fries', 'Popcorn', 'Steak', 'Noodles'
  ],
  Sports: [
    'Soccer', 'Basketball', 'Tennis', 'Baseball', 'Golf', 'Cricket', 'Rugby', 'Volleyball',
    'Swimming', 'Running', 'Skiing', 'Boxing', 'Cycling', 'Bowling', 'Surfing', 'Karate',
    'Badminton', 'Archery', 'Gymnastics', 'Ice Hockey', 'Snowboarding', 'Skateboarding', 'Fishing'
  ]
};

export function getRandomWords(category, count = 3) {
  const list = wordCategories[category] || wordCategories['Animals'];
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
