drop database if exists d0018e_store;
create database d0018e_store;

create table d0018e_store.user(
  user_id     SERIAL,
  first_name  varChar(15)             NOT NULL,
  last_name   varChar(15)             NOT NULL,
  email       varChar(50)   UNIQUE    NOT NULL,
  password    char(64)                NOT NULL,

  CONSTRAINT PK_user PRIMARY KEY(user_id)
);

create table d0018e_store.shopping_basket(
  shopping_basket_id    SERIAL,
  user_id               bigint  UNSIGNED  NOT NULL,

  CONSTRAINT PK_shopping_basket PRIMARY KEY(shopping_basket_id),

  CONSTRAINT FK_user_shopping_basket 
  FOREIGN KEY(user_id) REFERENCES d0018e_store.user(user_id)
  ON DELETE NO ACTION
  ON UPDATE CASCADE
);

create table d0018e_store.`order`(
  order_id              SERIAL,
  user_id               bigint            UNSIGNED    NOT NULL,
  shopping_basket_id    bigint            UNSIGNED    NOT NULL,
  order_date            datetime                      NOT NULL,

  CONSTRAINT PK_order PRIMARY KEY(order_id),

  CONSTRAINT FK_user_order 
  FOREIGN KEY(user_id) REFERENCES d0018e_store.user(user_id)
  ON DELETE NO ACTION
  ON UPDATE CASCADE,

  CONSTRAINT FK_shopping_basket_order 
  FOREIGN KEY(shopping_basket_id) REFERENCES d0018e_store.shopping_basket(shopping_basket_id)
  ON DELETE NO ACTION
  ON UPDATE CASCADE
);

create table d0018e_store.subject(
  subject_id        SERIAL,
  name              varChar(50)   UNIQUE    NOT NULL,

  CONSTRAINT PK_subject PRIMARY KEY(subject_id)
);

create table d0018e_store.asset(
  asset_id      SERIAL,
  subject_id    bigint        UNSIGNED,
  title         varChar(50)   UNIQUE,
  price         bigint        UNSIGNED   NOT NULL,
  amount        bigint        UNSIGNED   NOT NULL,
  description   varChar(150),

  CONSTRAINT PK_asset PRIMARY KEY(asset_id),

  CONSTRAINT FK_subject_asset
  FOREIGN KEY(subject_id) REFERENCES d0018e_store.subject(subject_id)
  ON DELETE SET NULL
  ON UPDATE CASCADE
);

create table d0018e_store.order_asset(
  order_asset_id  SERIAL,
  order_id        bigint     UNSIGNED   NOT NULL,
  asset_id        bigint     UNSIGNED   NOT NULL,
  asset_amount    bigint     UNSIGNED   NOT NULL,

  CONSTRAINT PK_order_asset PRIMARY KEY(order_asset_id),

  CONSTRAINT FK_order_order_asset 
  FOREIGN KEY(order_id) REFERENCES d0018e_store.`order`(order_id)
  ON DELETE NO ACTION
  ON UPDATE CASCADE,

  CONSTRAINT FK_asset_order_asset 
  FOREIGN KEY(asset_id) REFERENCES d0018e_store.asset(asset_id),

  CONSTRAINT UC_Comment UNIQUE(order_id, asset_id)
);

create table d0018e_store.shopping_basket_asset(
  shopping_basket_asset_id  SERIAL,
  shopping_basket_id        bigint   UNSIGNED   NOT NULL,
  asset_id                  bigint   UNSIGNED   NOT NULL,
  asset_amount              bigint   UNSIGNED   NOT NULL,

  CONSTRAINT PK_shopping_basket_asset PRIMARY KEY(shopping_basket_asset_id),

  CONSTRAINT FK_shopping_basket_shopping_basket_asset 
  FOREIGN KEY(shopping_basket_id) REFERENCES d0018e_store.shopping_basket(shopping_basket_id)
  ON DELETE NO ACTION
  ON UPDATE CASCADE,

  CONSTRAINT FK_Asset_shopping_basket_asset 
  FOREIGN KEY(asset_id) REFERENCES d0018e_store.asset(asset_id)
  ON DELETE NO ACTION
  ON UPDATE CASCADE
);

create table d0018e_store.comment(
  comment_id      SERIAL,
  user_id         bigint        UNSIGNED      NOT NULL,
  order_asset_id  bigint        UNSIGNED      NOT NULL,
  rating          bigint        UNSIGNED      NOT NULL,
  comment_text    varChar(150)                NOT NULL,

  CONSTRAINT PK_comment PRIMARY KEY(comment_id),

  CONSTRAINT FK_user_comment 
  FOREIGN KEY(user_id) REFERENCES d0018e_store.user(user_id)
  ON DELETE NO ACTION
  ON UPDATE CASCADE,

  CONSTRAINT FK_order_asset_comment 
  FOREIGN KEY(order_asset_id) REFERENCES d0018e_store.order_asset(order_asset_id)
  ON DELETE NO ACTION
  ON UPDATE CASCADE,

  CONSTRAINT UC_Comment UNIQUE(user_id, order_asset_id)
);

INSERT INTO d0018e_store.user 
(first_name,  last_name,  email,                        password) VALUES 
('admin',     'admin',  'admin@d0018e.com', '$2b$10$z.jgEUKenhqZX7bRizy6qOIGhLmJ4q1n96HaOLYARnvDirAAzzh.2');

INSERT INTO d0018e_store.shopping_basket 
(user_id) VALUES 
(1);

INSERT INTO d0018e_store.subject 
(name) VALUES 
("math");

INSERT INTO d0018e_store.asset
(subject_id,  title,                        price,  amount,   description) VALUES 
(1,           "matematik för nybörjare",    10,     3,        "Matematik för alla åldrar!");

/*
INSERT INTO d0018e_store.shopping_basket_asset
(shopping_basket_id,  asset_id,   asset_amount) VALUES 
(1,                   1,          3 );

INSERT INTO d0018e_store.`order`
(user_id,   shopping_basket_id, order_date) VALUES 
(1,         1,                  now());

INSERT INTO d0018e_store.order_asset
(order_id,  asset_id, asset_amount) VALUES 
(1,         1,        1);

INSERT INTO d0018e_store.comment
(user_id,   order_asset_id, rating, comment_text) VALUES 
(1,         1,              3,      'helt fantastiskt!');
*/

DROP TRIGGER IF EXISTS d0018e_store.process_order_asset;

DELIMITER $$

CREATE TRIGGER d0018e_store.process_shopping_basket_asset 
BEFORE INSERT ON d0018e_store.shopping_basket_asset FOR EACH ROW
    BEGIN
      declare curamount bigint UNSIGNED;

      set curamount := (select amount from d0018e_store.asset a where a.asset_id=new.asset_id);
      if (curamount < new.asset_amount) THEN
        signal sqlstate '45000' set message_text = 'Error: insufficient amount of provided item';
      elseif (new.asset_amount <= 0) THEN
        signal sqlstate '45000' set message_text = 'Error: the amount of items added to the shopping cart must be greater than zero';
      else
        update d0018e_store.asset set amount=amount-new.asset_amount where asset_id=new.asset_id; 
      end if;
END$$

DELIMITER ;