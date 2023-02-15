INSERT INTO product (productName, price, imgSrc, category, description stock, ) VALUES ('pn', 'p', './img/', 'cat', 'desc', 0);

INSERT INTO product (productName, price, imgSrc, category, description, stock, ) VALUES ('Derivator, integralen och sånt...', '459 kr', './img/DIOS.png', 'math', 'Används i kurserna M0047M, M0048M samt M0049M.', 0);
INSERT INTO product (productName, price, imgSrc, category, description, stock, ) VALUES ('Den kupade handen', '199 kr', './img/D0015E', 'tech', 'Används i den första kursen på datateknikprogrammet, D0015E.', 0);
INSERT INTO product (productName, price, imgSrc, category, description, stock, ) VALUES ('Mekanik statik och dynamik', '699 kr', './img/F0060T.png', 'physics', 'Används i högskoleingenjörerna på datateknikprogrammets enda fysikkurs F0060T.', 0);
INSERT INTO product (productName, price, imgSrc, category, description, stock, ) VALUES ('FYSIKA - Formelblad', '79 kr', './img/FYSIKA.png', 'math', 'Civilingenjörernas formelblad som används i både matematik och fysik.', 0);
INSERT INTO product (productName, price, imgSrc, category, description, stock, ) VALUES ('Digital design and computer architecture', '559 kr', './img/D0011E.png', 'tech', 'Bok för kurserna D0011E och D0013E.', 0);
INSERT INTO products (productName, price, imgSrc, description, category, stock, ) VALUES ('Introduction to algorithms', 359, './img/D0012E.png', 'Bok för kursen D0012E, algoritmer och datastrukturer.','tech', 0);


CREATE TABLE IF NOT EXISTS 'D0018E'.'product' (
    'id' INT UNSIGNED NOT NULL AUTO_INCREMENT, 
    'productName' TEXT NOT NULL, 
    'price' INT UNSIGNED NOT NULL, 
    'imgSrc' VARCHAR(36) NOT NULL, 
    'category' VARCHAR(36) NOT NULL,
    'description' TEXT NOT NULL,  
    'stock' INT NOT NULL, 
    PRIMARY KEY ('id')
);

INSERT INTO product (
    productName, 
    price, 
    imgSrc, 
    category, 
    description,
    stock
    ) 
    VALUES ('pn', 'p', './img/', 'cat', 'desc', 0
);

INSERT INTO product (productName, price, imgSrc, category, description, stock, ) VALUES ('Digital design and computer architecture', '559 kr', './img/D0011E.png', 'tech', 'Bok för kurserna D0011E och D0013E.', 0);
