USE second_hand_marketplace;

INSERT INTO categories (name)
SELECT 'Electronics' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Electronics');

INSERT INTO categories (name)
SELECT 'Books' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Books');

INSERT INTO categories (name)
SELECT 'Furniture' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Furniture');

INSERT INTO categories (name)
SELECT 'Clothing' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Clothing');

INSERT INTO categories (name)
SELECT 'Other' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Other');
