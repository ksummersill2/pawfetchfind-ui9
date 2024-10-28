-- Populate dog breeds table with common breeds
INSERT INTO dog_breeds (name, size_category, description, care_instructions, dietary_needs) VALUES
-- Small Breeds
('Chihuahua', 'small', 
 'The Chihuahua is the smallest breed of dog and is named after the Mexican state of Chihuahua. Known for their loyalty, sass, and compact size.',
 'Regular dental care is essential. Despite their small size, they need regular exercise and mental stimulation. Keep them warm as they get cold easily.',
 'High-quality small breed dog food. Feed 2-3 small meals daily to prevent hypoglycemia.'),

('Yorkshire Terrier', 'small',
 'The Yorkshire Terrier is a small terrier type dog breed, developed in Yorkshire, England. Known for their long silky coat and feisty personality.',
 'Daily coat brushing required. Regular professional grooming recommended. Dental hygiene is crucial.',
 'Premium small breed food. Watch for dental issues. Feed 3-4 small meals daily.'),

('Pug', 'small',
 'The Pug is a breed of dog with physically distinctive features of a wrinkly face and curled tail. Known for their charming, loving personality.',
 'Clean facial wrinkles daily to prevent infection. Moderate exercise needed. Watch for overheating.',
 'Control portions to prevent obesity. Feed high-quality food suitable for brachycephalic breeds.'),

-- Medium Breeds
('Beagle', 'medium',
 'The Beagle is a breed of small hound, similar in appearance to the much larger foxhound. Known for their great sense of smell and tracking instinct.',
 'Regular exercise crucial to prevent obesity. Check ears weekly for infections. Secure yard needed as they follow their nose.',
 'High-quality protein-rich food. Watch portions as they tend to overeat.'),

('Border Collie', 'medium',
 'The Border Collie is a working and herding dog breed. Known for being highly intelligent, extremely energetic, and acrobatic.',
 'Extensive daily exercise and mental stimulation required. Regular grooming needed.',
 'High-protein diet to support active lifestyle. Adjust portions based on activity level.'),

('Australian Shepherd', 'medium',
 'The Australian Shepherd is a herding dog breed. Known for their intelligence, work ethic, and versatility.',
 'High exercise needs. Regular grooming required. Mental stimulation crucial.',
 'High-quality protein-rich food. Adjust calories based on activity level.'),

-- Large Breeds
('German Shepherd', 'large',
 'The German Shepherd is a breed of medium to large-sized working dog. Known for their intelligence, strength, and trainability.',
 'Regular exercise and training needed. Watch for hip dysplasia. Regular grooming required.',
 'High-quality large breed food. Joint supplements often beneficial.'),

('Golden Retriever', 'large',
 'The Golden Retriever is a large-sized breed of dog bred as gun dogs. Known for their gentle nature and intelligence.',
 'Regular exercise needed. Prone to hip dysplasia. Regular grooming required.',
 'Large breed formula recommended. Watch for weight gain. Joint supplements beneficial.'),

('Labrador Retriever', 'large',
 'The Labrador Retriever is a breed of retriever-gun dog. Known for their friendly nature and intelligence.',
 'Regular exercise crucial. Prone to weight gain. Swimming is excellent exercise.',
 'High-quality large breed food. Watch portions to prevent obesity.'),

-- Giant Breeds
('Great Dane', 'giant',
 'The Great Dane is a German breed of domestic dog known for its giant size. Known for their gentle nature despite their size.',
 'Moderate exercise needed. Watch for bloat. Joint care important.',
 'Giant breed specific food. Multiple small meals to prevent bloat.'),

('Saint Bernard', 'giant',
 'The Saint Bernard is a breed of very large working dog from the Western Alps. Known for their size and rescue abilities.',
 'Moderate exercise needed. Regular grooming required. Watch for overheating.',
 'Giant breed formula essential. Multiple meals daily. Joint supplements recommended.'),

('Newfoundland', 'giant',
 'The Newfoundland is a large working dog. Known for their sweet temperament and swimming abilities.',
 'Regular swimming excellent exercise. Heavy grooming needs. Watch for overheating.',
 'High-quality giant breed food. Multiple meals daily to prevent bloat.');

-- Note: After inserting breeds, you'll need to set up life stages for each breed separately
-- as those requirements are more specific and vary by breed